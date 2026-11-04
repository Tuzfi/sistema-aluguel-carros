import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const imagens = resolve(import.meta.dirname, '../../docs/screenshots');
const senha = 'DemoSomenteTeste123!';
async function foto(page: Page, nome: string) {
  mkdirSync(imagens, { recursive: true });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          setTimeout(resolve, 4000);
        });
      })
    );
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: resolve(imagens, nome + '.png'), fullPage: true });
}
async function login(page: Page, usuario: string) {
  await page.goto('/login');
  await page.locator('#usuario').fill(usuario); await page.locator('#senha').fill(senha);
  await page.getByRole('button', { name: 'Entrar no Sistema' }).click();
  await expect(page).toHaveURL(/inicio/);
}
async function sair(page: Page) {
  await page.getByRole('button', { name: 'Sair da conta', exact: true }).click();
  await expect(page).toHaveURL(/login/);
}
test('cliente, banco e empresa concluem aluguel com crédito', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', e => erros.push(e.message));
  await page.goto('/login'); await foto(page, '01-login');
  await page.goto('/cadastro');
  for (const [id, valor] of Object.entries({ usuario: 'ana.demo', senha, nome: 'Ana Demonstração', cpf: '11144477735', rg: 'MG123456', profissao: 'Engenheira', endereco: 'Rua de Demonstração, 100' }))
    await page.locator('#'+id).fill(valor);
  await page.getByRole('button', { name: /Adicionar Renda/ }).click();
  await page.getByPlaceholder(/Empresa \/ Empregador/).fill('Empresa Fictícia');
  await page.locator('input[placeholder="Renda (ex: 3500.00)"]').fill('3500.00');
  await page.getByRole('button', { name: 'Finalizar Cadastro' }).click();
  await expect(page).toHaveURL(/inicio/);
  await page.goto('/veiculos'); await expect(page.getByText('Pulse Audace 1.0 Turbo')).toBeVisible();
  await foto(page, '02-catalogo');
  await page.goto('/pedidos/novo');
  await expect(page.locator('#veiculoId')).not.toHaveValue('');
  await page.locator('#inicio').fill('2027-12-10'); await page.locator('#fim').fill('2027-12-13');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/pedidos\/[a-f0-9-]{36}$/);
  const pedidoURL=page.url();
  await expect(page.getByRole('button', { name: 'Editar Pedido' })).toBeVisible();
  await page.getByRole('button', { name: 'Editar Pedido' }).click();
  await page.locator('#edit-fim').fill('2027-12-14');
  await page.getByRole('button', { name: 'Salvar e Reavaliar' }).click();
  await expect(page.getByText('Pedido alterado com sucesso! O status retornou para Pendente.')).toBeVisible();
  await foto(page, '03-pedido');
  await sair(page); await login(page,'banco'); await page.goto(pedidoURL);
  await expect(page.getByRole('button', { name: 'Cancelar Pedido', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar Pedido' }).click();
  await page.locator('#edit-fim').fill('2027-12-13');
  await page.getByRole('button', { name: 'Salvar e Reavaliar' }).click();
  await expect(page.getByText('Pedido alterado com sucesso! O status retornou para Pendente.')).toBeVisible();
  await page.getByRole('button', { name: 'Avaliar Pedido' }).click();
  await page.locator('#justificativa').fill('Rendimentos analisados; parecer favorável para a demonstração.');
  await page.getByRole('button', { name: 'Registrar Parecer' }).click();
  await expect(page.getByRole('button', { name: 'Oferecer Crédito' })).toBeVisible();
  await page.getByRole('button', { name: 'Oferecer Crédito' }).click();
  await page.locator('#principal').fill('200.00');
  await page.getByRole('button', { name: 'Registrar Oferta' }).click();
  await expect(page.getByRole('button', { name: 'Editar Crédito' })).toBeVisible();
  await page.getByRole('button', { name: 'Editar Crédito' }).click();
  await page.locator('#principal').fill('250.00');
  await page.getByRole('button', { name: 'Registrar Oferta' }).click();
  await expect(page.getByText('R$ 250.00', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Emitir Contrato', exact: true })).toHaveCount(0);
  await foto(page, '04-analise-credito');
  await sair(page); await login(page,'empresa');
  await page.goto('/frota'); await expect(page.getByRole('cell', { name: 'V101', exact: true })).toBeVisible();
  await foto(page, '05-frota');
  await page.goto(pedidoURL); await page.getByRole('button', { name: 'Emitir Contrato', exact: true }).click();
  await page.getByRole('button', { name: 'Confirmar e Emitir' }).click();
  await expect(page).toHaveURL(/contratos\//);
  await expect(page.getByText('Ana Demonstração')).toBeVisible();
  await expect(page.getByText('R$ 250.00', { exact: true })).toBeVisible();
  await expect(page.getByText('Invalid Date')).toHaveCount(0);
  await foto(page, '06-contrato');
  await sair(page); await login(page,'ana.demo'); await page.goto('/perfil');
  await expect(page.locator('#nome')).toHaveValue('Ana Demonstração');
  await foto(page, '07-perfil');
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/veiculos');
  await expect(page.getByText('Pulse Audace 1.0 Turbo')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await foto(page, '08-mobile');
  expect(erros).toEqual([]);
});


test('cliente cancela pedido, atualiza perfil e encerra cadastro', async ({ page }) => {
  await page.goto('/cadastro');
  for (const [id, valor] of Object.entries({ usuario: 'bruno.demo', senha, nome: 'Bruno Demonstração', cpf: '52998224725', rg: 'MG765432', profissao: 'Analista', endereco: 'Rua de Demonstração, 200' }))
    await page.locator('#'+id).fill(valor);
  await page.getByRole('button', { name: 'Finalizar Cadastro' }).click();
  await expect(page).toHaveURL(/inicio/);
  await page.goto('/perfil'); await page.locator('#nome').fill('Bruno Perfil Atualizado');
  await page.getByRole('button', { name: 'Salvar Alterações' }).click();
  await expect(page.getByText('Perfil e informações de renda atualizados com sucesso!')).toBeVisible();
  await page.reload(); await expect(page.locator('#nome')).toHaveValue('Bruno Perfil Atualizado');
  await page.goto('/pedidos/novo'); await expect(page.locator('#veiculoId')).not.toHaveValue('');
  await page.locator('#inicio').fill('2028-01-10'); await page.locator('#fim').fill('2028-01-13');
  await page.locator('button[type="submit"]').click(); await expect(page).toHaveURL(/pedidos\/[a-f0-9-]{36}$/);
  await page.getByRole('button', { name: 'Cancelar Pedido', exact: true }).click();
  await page.getByRole('button', { name: 'Sim, cancelar pedido' }).click();
  await expect(page.getByText('Pedido cancelado com sucesso.')).toBeVisible();
  await page.goto('/perfil'); await page.getByRole('button', { name: 'Encerrar Minha Conta' }).click();
  await page.getByRole('button', { name: 'Sim, encerrar conta' }).click();
  await expect(page).toHaveURL(/login/);
});
