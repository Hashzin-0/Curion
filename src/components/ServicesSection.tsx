'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Service, Currency } from '@/types/site';
import { cn } from '@/lib/utils';
import { Package, Clock, DollarSign, Bookmark } from 'lucide-react';

interface ServicesSectionProps {
  services?: Service[];
  isLoading?: boolean;
}

const currencySymbols: Record<Currency, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
};

const priceTypeLabels: Record<string, string> = {
  fixed: 'Preço fixo',
  hourly: '/hora',
  project: '/projeto',
  contact: 'Sob consulta',
};

function formatPrice(price: number | null, currency: Currency, priceType: string): string {
  if (price === null || priceType === 'contact') {
    return priceTypeLabels[priceType] || 'Sob consulta';
  }
  return `${currencySymbols[currency]} ${price.toLocaleString('pt-BR')}`;
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
      
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Package className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </div>
        <span className={cn(
          "text-xs font-bold px-3 py-1 rounded-full",
          service.is_active 
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
        )}>
          {service.is_active ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
        {service.name}
      </h3>
      
      {service.description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
          {service.description}
        </p>
      )}

      <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-500 mb-4">
        {service.price !== null && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatPrice(service.price, service.currency, service.price_type)}
            </span>
            {service.price_type !== 'fixed' && service.price_type !== 'contact' && (
              <span className="text-xs">{priceTypeLabels[service.price_type]}</span>
            )}
          </div>
        )}
        {service.delivery_time && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{service.delivery_time}</span>
          </div>
        )}
      </div>

      {service.packages && service.packages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
            Pacotes disponíveis
          </p>
          <div className="space-y-2">
            {service.packages.map((pkg, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-700 dark:text-slate-300">{pkg.name}</span>
                </div>
                {pkg.price !== undefined && (
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {currencySymbols[service.currency]} {pkg.price.toLocaleString('pt-BR')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Package className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        Nenhum serviço encontrado
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
        Você ainda não possui serviços cadastrados. Adicione seus serviços para apresentar suas ofertas.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="w-16 h-6 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
          <div className="flex gap-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServicesSection({ services = [], isLoading = false }: ServicesSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (!services || services.length === 0) {
    return <EmptyState />;
  }

  const activeServices = services.filter(s => s.is_active);
  const inactiveServices = services.filter(s => !s.is_active);

  return (
    <section className="py-8">
      {activeServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {activeServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}

      {inactiveServices.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
            Serviços inativos ({inactiveServices.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
            {inactiveServices.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}