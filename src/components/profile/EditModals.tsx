'use client';

import { Modal } from "@/components/feedback/Modal";
import { Button } from "@/components/ui/Button";
import { inputCls, labelCls } from "@/components/ui/SharedUI";
import { RichEditor } from "@/components/RichEditor";
import { Education, Experience, PortfolioItem, ProfessionalArea } from "@/lib/store";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
}

const EditModal = ({ isOpen, onClose, title, children, onSubmit, submitText }: EditModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      <Button className="w-full" type="submit">{submitText}</Button>
    </form>
  </Modal>
);

type EditableEducation = Partial<Education> & { institution?: string; course?: string };
type EditableExperience = Partial<Experience> & { role?: string; company_name?: string; description?: string };
type EditablePortfolio = Partial<PortfolioItem> & { title?: string; description?: string };
type AreaFormData = { name: string; theme_color: string };

export const EducationModal = ({ editingEdu, setEditingEdu, onSave }: { editingEdu: EditableEducation | null; setEditingEdu: (e: EditableEducation | null) => void; onSave: (e: EditableEducation, onDone: () => void) => void }) => (
  <EditModal 
    isOpen={!!editingEdu} 
    onClose={() => setEditingEdu(null)} 
    title="Editar Formação" 
    onSubmit={(e) => { e.preventDefault(); onSave(editingEdu as EditableEducation, () => setEditingEdu(null)); }}
    submitText="Salvar"
  >
    <div><label className={labelCls}>Instituição</label><input required value={editingEdu?.institution || ''} onChange={e => setEditingEdu((p) => p ? {...p, institution: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Curso</label><input required value={editingEdu?.course || ''} onChange={e => setEditingEdu((p) => p ? {...p, course: e.target.value} : null)} className={inputCls} /></div>
  </EditModal>
);

export const ExperienceModal = ({ editingExp, setEditingExp, onSave }: { editingExp: EditableExperience | null; setEditingExp: (e: EditableExperience | null) => void; onSave: (e: EditableExperience, onDone: () => void) => void }) => (
  <EditModal 
    isOpen={!!editingExp} 
    onClose={() => setEditingExp(null)} 
    title="Editar Experiência" 
    onSubmit={(e) => { e.preventDefault(); onSave(editingExp as EditableExperience, () => setEditingExp(null)); }}
    submitText="Atualizar"
  >
    <div><label className={labelCls}>Cargo</label><input required value={editingExp?.role || ''} onChange={e => setEditingExp((p) => p ? {...p, role: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Empresa</label><input required value={editingExp?.company_name || ''} onChange={e => setEditingExp((p) => p ? {...p, company_name: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Descrição</label><RichEditor content={editingExp?.description || ''} onChange={(v: string) => setEditingExp((p) => p ? {...p, description: v} : null)} /></div>
  </EditModal>
);

export const PortfolioModal = ({ editingPort, setEditingPort, onSave }: { editingPort: EditablePortfolio | null; setEditingPort: (e: EditablePortfolio | null) => void; onSave: (e: EditablePortfolio, onDone: () => void) => void }) => (
  <EditModal 
    isOpen={!!editingPort} 
    onClose={() => setEditingPort(null)} 
    title="Editar Portfólio" 
    onSubmit={(e) => { e.preventDefault(); onSave(editingPort as EditablePortfolio, () => setEditingPort(null)); }}
    submitText="Salvar"
  >
    <div><label className={labelCls}>Título</label><input required value={editingPort?.title || ''} onChange={e => setEditingPort((p) => p ? {...p, title: e.target.value} : null)} className={inputCls} /></div>
    <div><label className={labelCls}>Descrição</label><textarea className={inputCls} rows={4} value={editingPort?.description || ''} onChange={e => setEditingPort((p) => p ? {...p, description: e.target.value} : null)} /></div>
  </EditModal>
);

export const AreaModal = ({ editingArea, setEditingArea, areaForm, setAreaForm, onSave }: { editingArea: ProfessionalArea | null; setEditingArea: (e: ProfessionalArea | null) => void; areaForm: AreaFormData; setAreaForm: (f: AreaFormData) => void; onSave: (e: ProfessionalArea, onDone: () => void) => void }) => (
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
