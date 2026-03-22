'use client';

import { useState } from 'react';
import { useSiteBuilderStore } from '@/lib/stores/siteBuilderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, GripVertical, X } from 'lucide-react';
import type { Service, Currency, PriceType } from '@/types/site';

export function ServiceEditor() {
  const { services, createService, updateService, deleteService, reorderServices } =
    useSiteBuilderStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Serviços</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Novo Serviço</span>
        </button>
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isEditing={editingId === service.id}
            onEdit={() => setEditingId(service.id)}
            onCancel={() => setEditingId(null)}
            onDelete={() => deleteService(service.id)}
          />
        ))}
      </div>

      {services.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Nenhum serviço cadastrado.</p>
          <p className="text-xs mt-1">Clique em "Novo Serviço" para adicionar.</p>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ServiceForm
              onSave={async (data) => {
                await createService({
                  ...data,
                  currency: data.currency || 'BRL',
                  price_type: data.price_type || 'fixed',
                  packages: [],
                } as Service);
                setIsAdding(false);
              }}
              onCancel={() => setIsAdding(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ServiceCard({ service, isEditing, onEdit, onCancel, onDelete }: ServiceCardProps) {
  const { updateService } = useSiteBuilderStore();

  if (isEditing) {
    return (
      <ServiceForm
        initialData={service}
        onSave={async (data) => {
          await updateService(service.id, data);
          onCancel();
        }}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg">
      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />

      <div className="flex-1">
        <h4 className="font-medium">{service.name}</h4>
        {service.description && (
          <p className="text-sm text-gray-500 line-clamp-1">{service.description}</p>
        )}
      </div>

      {service.price && (
        <div className="text-right">
          <p className="font-semibold">
            {service.currency === 'BRL' ? 'R$' : service.currency === 'EUR' ? '€' : '$'}
            {service.price.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {service.price_type === 'hourly' && '/hora'}
            {service.price_type === 'project' && '/projeto'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

interface ServiceFormProps {
  initialData?: Service;
  onSave: (data: Partial<Service>) => Promise<void>;
  onCancel: () => void;
}

function ServiceForm({ initialData, onSave, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'BRL');
  const [priceType, setPriceType] = useState<PriceType>(
    initialData?.price_type || 'fixed'
  );
  const [deliveryTime, setDeliveryTime] = useState(initialData?.delivery_time || '');
  const [bookingUrl, setBookingUrl] = useState(initialData?.booking_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    await onSave({
      name,
      description: description || null,
      price: price ? parseFloat(price) : null,
      currency,
      price_type: priceType,
      delivery_time: deliveryTime || null,
      booking_url: bookingUrl || null,
    });
    setIsSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white border border-primary/30 rounded-lg space-y-4"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {initialData ? 'Editar Serviço' : 'Novo Serviço'}
        </h4>
        <button type="button" onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do Serviço *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Criação de Sites"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o serviço..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Moeda
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="BRL">BRL (R$)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as PriceType)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="fixed">Fixo</option>
            <option value="hourly">Por hora</option>
            <option value="project">Por projeto</option>
            <option value="contact">Sob consulta</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tempo de Entrega
          </label>
          <input
            type="text"
            value={deliveryTime}
            onChange={(e) => setDeliveryTime(e.target.value)}
            placeholder="Ex: 7 dias úteis"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link de Agendamento
          </label>
          <input
            type="url"
            value={bookingUrl}
            onChange={(e) => setBookingUrl(e.target.value)}
            placeholder="https://calendly.com/..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving || !name.trim()}
          className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
