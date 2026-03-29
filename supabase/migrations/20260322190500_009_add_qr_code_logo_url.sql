-- Migration 009: Add QR Code Logo URL
-- Adiciona campo para configurar o logo no QR code

ALTER TABLE "site_configs" ADD COLUMN "qr_code_logo_url" text DEFAULT '/icon-512.png';
