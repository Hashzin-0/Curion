'use client';

import { Modal, Button, inputCls, labelCls } from "@/components/ui/SharedUI";
import { RichEditor } from "@/components/RichEditor";

const EditModal = ({ isOpen, onClose, title, children, onSubmit, submitText }: any) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      <Button className="w-full" type="submit">{submitText}</Button>
    </form>
  </Modal>
);

export const EducationModal = ({ editingEdu, setEditingEdu, onSave }: any) => (
  <EditModal 
    isOpen={!!editingEdu} 
    onClose={() => setEditingEdu(null)} 
    title="Editar Formação" 
    onSubmit={(e: any) => { e.preventDefault(); onSave(editingEdu, () => setEditingEdu(null)); }}
    submitText="Salvar"
  >
    <div><label className={labelCls}>Instituição</label><input required value={editingEdu?.institution || ''} onChange={e => setEditingEdu((p: any) => p ? {...p, institution: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Curso</label><input required value={editingEdu?.course || ''} onChange={e => setEditingEdu((p: any) => p ? {...p, course: e.target.value} : null)} className={inputCls} /></div>
  </EditModal>
);

export const ExperienceModal = ({ editingExp, setEditingExp, onSave }: any) => (
  <EditModal 
    isOpen={!!editingExp} 
    onClose={() => setEditingExp(null)} 
    title="Editar Experiência" 
    onSubmit={(e: any) => { e.preventDefault(); onSave(editingExp, () => setEditingExp(null)); }}
    submitText="Atualizar"
  >
    <div><label className={labelCls}>Cargo</label><input required value={editingExp?.role || ''} onChange={e => setEditingExp((p: any) => p ? {...p, role: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Empresa</label><input required value={editingExp?.company_name || ''} onChange={e => setEditingExp((p: any) => p ? {...p, company_name: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Descrição</label><RichEditor content={editingExp?.description || ''} onChange={(v: any) => setEditingExp((p: any) => p ? {...p, description: v} : null)} /></div>
  </EditModal>
);

export const PortfolioModal = ({ editingPort, setEditingPort, onSave }: any) => (
  <EditModal 
    isOpen={!!editingPort} 
    onClose={() => setEditingPort(null)} 
    title="Editar Portfólio" 
    onSubmit={(e: any) => { e.preventDefault(); onSave(editingPort, () => setEditingPort(null)); }}
    submitText="Salvar"
  >
    <div><label className={labelCls}>Título</label><input required value={editingPort?.title || ''} onChange={e => setEditingPort((p: any) => p ? {...p, title: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Descrição</label><textarea className={inputCls} rows={4} value={editingPort?.description || ''} onChange={e => setEditingPort((p: any) => p ? {...p, description: e.target.value} : null)} /></div>
  </EditModal>
);

export const AreaModal = ({ editingArea, setEditingArea, areaForm, setAreaForm, onSave }: any) => (
  <Modal isOpen={!!editingArea} onClose={() => setEditingArea(null)} title="Estilo da Área">
    <div className="space-y-4">
      <div><label className={labelCls}>Nome da Área</label><input value={areaForm.name || ''} onChange={e => setAreaForm({...areaForm, name: e.target.value})} className={inputCls} /></div>
      <div>
        <label className={labelCls}>Cor Principal</label>
        <div className="flex gap-2">
          <input type="color" value={areaForm.theme_color || '#3b82f6'} onChange={e => setAreaForm({...areaForm, theme_color: e.target.value})} className="h-12 w-12 rounded-xl cursor-pointer" />
          <input value={areaForm.theme_color || ''} onChange={e => setAreaForm({...areaForm, theme_color: e.target.value})} className="flex-1 font-mono uppercase text-sm px-4 rounded-xl border" />
        </div>
      </div>
      <Button className="w-full" onClick={() => onSave({ ...editingArea, ...areaForm }, () => setEditingArea(null))}>Aplicar Design</Button>
    </div>
  </Modal>
);
