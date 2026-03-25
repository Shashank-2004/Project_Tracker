import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Status } from '../types';

interface DnDState {
  active: boolean;
  taskId: string | null;
  sourceCard: HTMLElement | null;
  sourceCol: Status | null;
  placeholder: HTMLElement | null;
  ghost: HTMLElement | null;
  overCol: Status | null;
  originRect: DOMRect | null;
  offsetX: number;
  offsetY: number;
  pointerId: number | null;
  longPressTimer: ReturnType<typeof setTimeout> | null;
}

const DND_MOVE_THRESHOLD = 6;
const DND_LONGPRESS_MS = 180;

export function useKanbanDnD() {
  const { moveTask } = useStore();
  const dndState = useRef<DnDState>({
    active: false, taskId: null, sourceCard: null, sourceCol: null,
    placeholder: null, ghost: null, overCol: null, originRect: null,
    offsetX: 0, offsetY: 0, pointerId: null, longPressTimer: null,
  });

  const dndReset = () => {
    const s = dndState.current;
    s.active = false; s.taskId = null; s.sourceCard = null; s.sourceCol = null;
    s.placeholder = null; s.ghost = null; s.overCol = null; s.originRect = null;
    s.offsetX = 0; s.offsetY = 0; s.pointerId = null;
    if (s.longPressTimer) {
      clearTimeout(s.longPressTimer);
      s.longPressTimer = null;
    }
  };

  const dndCreateGhost = (card: HTMLElement, rect: DOMRect) => {
    const g = card.cloneNode(true) as HTMLElement;
    g.className = card.className + ' dnd-ghost';
    g.removeAttribute('data-id');
    g.style.cssText = `width:${rect.width}px;left:${rect.left}px;top:${rect.top}px;opacity:0;transform:rotate(0) scale(1)`;
    document.body.appendChild(g);
    requestAnimationFrame(() => {
      g.style.transition = 'opacity .12s ease,transform .12s ease';
      g.style.opacity = '0.92';
      g.style.transform = 'rotate(2.5deg) scale(1.04)';
    });
    return g;
  };

  const dndCreatePlaceholder = (h: number) => {
    const ph = document.createElement('div');
    ph.className = 'bg-[rgba(79,142,247,.06)] border-2 border-dashed border-[rgba(79,142,247,.45)] rounded-[var(--radius-lg)] pointer-events-none dnd-placeholder';
    ph.style.cssText = `height:${h}px;min-height:${h}px;flex-shrink:0`;
    ph.setAttribute('aria-hidden', 'true');
    return ph;
  };

  const dndColAtPoint = (x: number, y: number) => {
    const s = dndState.current;
    if (s.ghost) s.ghost.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (s.ghost) s.ghost.style.display = '';
    if (!el) return null;
    let cur: HTMLElement | null = el as HTMLElement;
    while (cur && cur !== document.body) {
      if (cur.classList.contains('kanban-cards')) return cur;
      if (cur.classList.contains('kanban-col')) return cur.querySelector('.kanban-cards') as HTMLElement;
      cur = cur.parentElement;
    }
    return null;
  };

  const dndUpdatePlaceholder = (colEl: HTMLElement, clientY: number) => {
    const s = dndState.current;
    if (!s.placeholder) return;
    const cards = Array.from(colEl.querySelectorAll('.task-card:not(.dnd-source):not(.dnd-placeholder):not(.empty-col)')) as HTMLElement[];
    let ref: HTMLElement | null = null;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      if (clientY < r.top + r.height * 0.5) { ref = c; break; }
    }
    if (s.placeholder.nextElementSibling !== ref || s.placeholder.parentElement !== colEl) {
      colEl.insertBefore(s.placeholder, ref);
    }
  };

  const dndHighlight = (activeEl: HTMLElement | null) => {
    document.querySelectorAll('.kanban-cards').forEach(c => {
      c.classList.toggle('bg-[rgba(79,142,247,.09)]', c === activeEl);
      c.classList.toggle('shadow-[inset_0_0_0_2px_rgba(79,142,247,.35)]', c === activeEl);
    });
  };

  const dndOnMove = (x: number, y: number) => {
    const s = dndState.current;
    if (!s.active || !s.ghost || !s.placeholder) return;
    s.ghost.style.transition = 'none';
    s.ghost.style.left = (x - s.offsetX) + 'px';
    s.ghost.style.top = (y - s.offsetY) + 'px';

    const colEl = dndColAtPoint(x, y);
    s.overCol = colEl ? (colEl.dataset.dropCol as Status) : null;
    dndHighlight(colEl);

    if (colEl) {
      if (s.placeholder.parentElement !== colEl) colEl.appendChild(s.placeholder);
      dndUpdatePlaceholder(colEl, y);
    } else {
      const srcEl = document.querySelector(`[data-drop-col="${s.sourceCol}"]`);
      if (srcEl && s.placeholder.parentElement !== srcEl) srcEl.appendChild(s.placeholder);
    }
  };

  const dndOnEnd = (commit: boolean) => {
    const s = dndState.current;
    if (!s.active) return;
    document.querySelectorAll('.kanban-cards').forEach(c => {
      c.classList.remove('bg-[rgba(79,142,247,.09)]', 'shadow-[inset_0_0_0_2px_rgba(79,142,247,.35)]');
    });
    if (s.placeholder && s.placeholder.parentElement) s.placeholder.remove();

    if (commit && s.overCol && s.ghost && s.sourceCard && s.sourceCol !== s.overCol) {
      s.ghost.style.transition = 'opacity .12s ease';
      s.ghost.style.opacity = '0';
      const g = s.ghost;
      setTimeout(() => g.remove(), 140);
      s.sourceCard.classList.remove('dnd-source', 'invisible', 'pointer-events-none');
      moveTask(s.taskId!, s.overCol);
    } else if (s.ghost && s.originRect && s.sourceCard) {
      s.sourceCard.classList.remove('dnd-source', 'invisible', 'pointer-events-none');
      s.ghost.classList.add('snapping');
      s.ghost.style.left = s.originRect.left + 'px';
      s.ghost.style.top = s.originRect.top + 'px';
      s.ghost.style.opacity = '0';
      s.ghost.style.transform = 'rotate(0) scale(0.96)';
      const g = s.ghost;
      const cleanup = () => g.remove();
      g.addEventListener('transitionend', cleanup, { once: true });
      setTimeout(cleanup, 400);
    }
    dndReset();
  };

  const dndActivate = (card: HTMLElement, x: number, y: number) => {
    const s = dndState.current;
    const rect = card.getBoundingClientRect();
    s.active = true;
    s.originRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom, x: rect.x, y: rect.y, toJSON: () => {} };
    s.offsetX = x - rect.left;
    s.offsetY = y - rect.top;
    
    const colEl = card.closest('[data-drop-col]') as HTMLElement;
    s.sourceCol = (colEl?.dataset.dropCol) as Status;
    
    card.classList.add('dnd-source', 'invisible', 'pointer-events-none');
    const ph = dndCreatePlaceholder(rect.height);
    s.placeholder = ph;
    if (card.parentElement && card.nextSibling) {
      card.parentElement.insertBefore(ph, card.nextSibling);
    } else if (card.parentElement) {
      card.parentElement.appendChild(ph);
    }
    s.ghost = dndCreateGhost(card, rect);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    if (e.button && e.button !== 0) return;
    const s = dndState.current;
    if (s.active) return;
    
    if ((e.target as HTMLElement).tagName.toLowerCase() === 'button') return;
    
    e.preventDefault();
    const card = e.currentTarget as HTMLElement;
    s.taskId = id;
    s.sourceCard = card;
    s.pointerId = e.pointerId;
    let pending = { x: e.clientX, y: e.clientY };

    if (e.pointerType === 'touch') {
      s.longPressTimer = setTimeout(() => {
        if (pending) { dndActivate(card, pending.x, pending.y); card.setPointerCapture(s.pointerId!); pending = {x:0, y:0}; } // hack
      }, DND_LONGPRESS_MS);
    } else {
      dndActivate(card, e.clientX, e.clientY);
      if (s.ghost) {
        s.ghost.style.opacity = '0';
        s.ghost.style.transition = 'none';
      }
      card.setPointerCapture(s.pointerId);
    }

    const onPointerMove = (ev: PointerEvent) => {
      if (s.taskId !== id) return;
      if (pending && pending.x !== 0) {
        if (Math.hypot(ev.clientX - pending.x, ev.clientY - pending.y) > DND_MOVE_THRESHOLD) {
          if (s.longPressTimer) clearTimeout(s.longPressTimer);
          dndActivate(card, pending.x, pending.y);
          card.setPointerCapture(s.pointerId!);
          pending = {x:0, y:0};
          dndOnMove(ev.clientX, ev.clientY);
        }
        return;
      }
      if (!s.active) return;
      if (s.ghost && s.ghost.style.opacity === '0') {
        s.ghost.style.transition = 'opacity .08s ease,transform .12s ease';
        s.ghost.style.opacity = '0.92';
        s.ghost.style.transform = 'rotate(2.5deg) scale(1.04)';
      }
      dndOnMove(ev.clientX, ev.clientY);
    };

    const onPointerUp = () => {
      if (s.taskId !== id) return;
      if (s.longPressTimer) clearTimeout(s.longPressTimer);
      document.body.style.cursor = '';
      if (s.active) dndOnEnd(true);
      else dndReset();
      cleanup();
    };

    const onPointerCancel = () => {
      if (s.taskId !== id) return;
      if (s.longPressTimer) clearTimeout(s.longPressTimer);
      document.body.style.cursor = '';
      if (s.active) dndOnEnd(false);
      else dndReset();
      cleanup();
    };

    const cleanup = () => {
      card.removeEventListener('pointermove', onPointerMove);
      card.removeEventListener('pointerup', onPointerUp);
      card.removeEventListener('pointercancel', onPointerCancel);
    };

    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', onPointerUp);
    card.addEventListener('pointercancel', onPointerCancel);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dndState.current.active) {
        document.body.style.cursor = '';
        dndOnEnd(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line

  return { handlePointerDown };
}
