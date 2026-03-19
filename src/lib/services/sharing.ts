
/**
 * @fileOverview Serviço de compartilhamento e geração de Identidade Digital.
 */

export const SharingService = {
  /**
   * Gera um arquivo vCard (VCF) para integração com a agenda do celular.
   */
  generateVCard(user: any) {
    const cleanSummary = user.summary?.replace(/<[^>]*>/g, '').slice(0, 100) || '';
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${user.name}`,
      `TITLE:${user.headline || 'Profissional'}`,
      `TEL;TYPE=CELL:${user.phone || ''}`,
      `EMAIL;TYPE=INTERNET:${user.email || ''}`,
      `URL:${window.location.origin}/${user.username}`,
      `NOTE:Curion X Profile: ${cleanSummary}`,
      'END:VCARD'
    ].join('\n');

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${user.username}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Compartilha o link do perfil via API nativa do sistema.
   */
  async shareProfile(user: any) {
    const shareData = {
      title: `Curion X — ${user.name}`,
      text: `Confira meu portfólio interativo e currículo inteligente:`,
      url: `${window.location.origin}/${user.username}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        return 'copied';
      }
    } catch (err) {
      return 'error';
    }
  }
};
