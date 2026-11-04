export function obterFotoVeiculo(modelo?: string, marca?: string, fotoUrl?: string): string {
  if (fotoUrl && fotoUrl.trim().length > 0) {
    return fotoUrl.trim();
  }

  const texto = `${marca || ''} ${modelo || ''}`.toLowerCase();

  if (texto.includes('pulse')) {
    return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
  }
  if (texto.includes('onix')) {
    return 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80';
  }
  if (texto.includes('corolla')) {
    return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80';
  }
  if (texto.includes('argo') || texto.includes('hb20') || texto.includes('polo')) {
    return 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80';
  }
  if (texto.includes('suv') || texto.includes('compass') || texto.includes('renegade') || texto.includes('creta')) {
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';
  }

  return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80';
}
