-- ==========================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION FOR "pride"
-- Execute estes comandos no "SQL Editor" do seu painel do Supabase.
-- ==========================================================================

-- 1. Criar o Bucket público chamado "pride"
-- Configura o bucket com status público e limite de tamanho de 50MB (52428800 bytes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pride',          -- ID único do bucket
    'pride',          -- Nome exibido
    true,             -- 'true' define o bucket como público (leitura livre)
    52428800,         -- Limite de arquivo (50MB em bytes)
    NULL              -- Tipos de arquivo permitidos (NULL aceita qualquer tipo: png, jpg, webp, etc)
)
ON CONFLICT (id) DO NOTHING;


-- 2. Configurar Políticas de Segurança (Row Level Security - RLS)
-- As políticas abaixo são aplicadas na tabela `storage.objects` para o bucket 'pride'.

-- POLÍTICA A: Acesso de Leitura Público (SELECT)
-- Permite que qualquer pessoa na internet visualize/baixe as fotos usando a URL pública.
CREATE POLICY "Permitir Leitura Publica" ON storage.objects
FOR SELECT
USING (bucket_id = 'pride');


-- POLÍTICA B: Permissão para Upload (INSERT)
-- OPÇÃO 1: Apenas usuários autenticados no Supabase podem fazer upload (RECOMENDADO para evitar spam)
CREATE POLICY "Permitir Upload para Autenticados" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pride');

-- OPÇÃO 2: Se você quiser que QUALQUER pessoa possa fazer upload sem login, remova os traços da linha abaixo:
-- CREATE POLICY "Permitir Upload Publico" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'pride');


-- POLÍTICA C: Permissão para Edição/Atualização (UPDATE)
-- Permite que usuários autenticados atualizem/substituam arquivos no bucket.
CREATE POLICY "Permitir Atualizacao para Autenticados" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pride')
WITH CHECK (bucket_id = 'pride');


-- POLÍTICA D: Permissão para Exclusão (DELETE)
-- Permite que usuários autenticados deletem arquivos do bucket.
CREATE POLICY "Permitir Exclusao para Autenticados" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pride');
