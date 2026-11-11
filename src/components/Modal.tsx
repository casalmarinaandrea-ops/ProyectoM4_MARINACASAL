import { useEffect, useId, useRef, type ReactNode } from 'react';
export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
 const ref=useRef<HTMLDialogElement>(null); const id=useId();
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return ()=>dialog?.close();},[]);
 return <dialog ref={ref} className="modal" aria-labelledby={id} onCancel={e=>{e.preventDefault();onClose();}}><div className="modal-heading"><h2 id={id}>{title}</h2><button className="icon-btn" aria-label="Cerrar ventana" onClick={onClose}>×</button></div>{children}</dialog>;
}
