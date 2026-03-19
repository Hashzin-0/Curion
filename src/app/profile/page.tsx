
'use client';

import { useProfileState } from '@/modules/profile/hooks/useProfileState';
import { useProfileData } from '@/modules/profile/hooks/useProfileData';
import * as LucideIcons from 'lucide-react';
import { ThemedProfileLayout } from '@/components/ThemedProfileLayout';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { EducationModal, ExperienceModal, PortfolioModal, AreaModal } from '@/components/profile/EditModals';
import { AddContentModal } from '@/components/AddContentModal';
import { useAnalytics } from '@/modules/profile/hooks/useAnalytics';
import { useEffect } from 'react';

export default function Dashboard() {
  const state = useProfileState();
  const data = useProfileData();
  
  // Prefetch das métricas assim que o componente monta
  const { isLoading: isLoadingMetrics } = useAnalytics(state.currentUser?.id);

  if (!state.isAuthReady || (state.isLoading && !state.currentUser)) { 
    return <div className="min-h-screen flex items-center justify-center"><LucideIcons.Loader2 className="animate-spin" /></div>;
  }
  if (!state.currentUser) return null;

  return (
    <>
      <ProfileHeader 
        activeTab={state.activeTab} 
        setActiveTab={state.setActiveTab} 
        copyProfileLink={data.copyProfileLink} 
        copied={data.copied} 
        username={state.currentUser.username}
        router={state.router}
      />

      {state.activeTab === 'profile' ? (
        <ThemedProfileLayout
          user={state.currentUser} 
          areas={data.areas} 
          education={data.education.filter(e => e.user_id === state.currentUser!.id)} 
          portfolio={data.portfolio.filter(p => p.user_id === state.currentUser!.id)}
          isOwner={true} 
          onEditProfile={() => state.setIsEditingProfile(true)} 
          onAddContent={() => state.setIsAddingContent(true)}
          onEditArea={(area: any) => { state.setEditingArea(area); state.setAreaForm(area); }} 
          onDeleteArea={data.handleDeleteArea}
          onEditEducation={state.setEditingEdu} 
          onDeleteEducation={data.handleDeleteEdu} 
          onEditPortfolio={state.setEditingPort} 
          onDeletePortfolio={data.handleDeletePort}
          onEditExperience={state.setEditingExp}
          onDeleteExperience={data.handleDeleteExp}
          theme={data.profileTheme} 
          isLoadingTheme={data.isLoadingTheme} 
          username={state.currentUser.username}
        />
      ) : (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-12 pt-24">
          <div className="max-w-5xl mx-auto space-y-12">
            <header>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Seu Alcance Profissional</h1>
              <p className="text-slate-500 font-medium">Veja como os recrutadores estão interagindo com seu portfólio.</p>
            </header>
            <AnalyticsDashboard userId={state.currentUser.id} />
          </div>
        </div>
      )}

      <AddContentModal isOpen={state.isAddingContent} onClose={() => state.setIsAddingContent(false)} />
      <EditProfileModal 
        isOpen={state.isEditingProfile} 
        onClose={() => state.setIsEditingProfile(false)} 
        editedProfile={state.editedProfile} 
        setEditedProfile={state.setEditedProfile} 
        onSave={data.handleUpdateProfile}
        isSaving={data.isProcessing}
      />
      <EducationModal editingEdu={state.editingEdu} setEditingEdu={state.setEditingEdu} onSave={data.handleSaveEdu} />
      <ExperienceModal editingExp={state.editingExp} setEditingExp={state.setEditingExp} onSave={data.handleSaveExp} />
      <PortfolioModal editingPort={state.editingPort} setEditingPort={state.setEditingPort} onSave={data.handleSavePort} />
      <AreaModal 
        editingArea={state.editingArea} 
        setEditingArea={state.setEditingArea} 
        areaForm={state.areaForm} 
        setAreaForm={state.setAreaForm} 
        onSave={data.handleSaveArea}
      />
    </>
  );
}
