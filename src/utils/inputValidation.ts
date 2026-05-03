import { z } from 'zod';
import DOMPurify from 'dompurify';

/**
 * Sanitiza input removendo tags HTML e scripts
 */
export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  }).trim();
}

/**
 * Sanitiza objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * Valida email
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .transform(sanitizeInput);

/**
 * Valida telefone brasileiro
 */
export const phoneSchema = z.string()
  .regex(/^[0-9]{10,11}$/, 'Telefone inválido. Use formato: 11987654321')
  .transform(sanitizeInput);

/**
 * Valida nome
 */
export const nameSchema = z.string()
  .min(3, 'Nome muito curto')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
  .transform(sanitizeInput);

/**
 * Valida endereço
 */
export const addressSchema = z.string()
  .min(5, 'Endereço muito curto')
  .max(200, 'Endereço muito longo')
  .transform(sanitizeInput);

/**
 * Valida CEP
 */
export const cepSchema = z.string()
  .regex(/^[0-9]{8}$/, 'CEP inválido. Use formato: 12345678')
  .transform(sanitizeInput);

/**
 * Valida texto livre com limite
 */
export const textSchema = (maxLength: number = 1000) => 
  z.string()
    .max(maxLength, `Texto muito longo (máximo ${maxLength} caracteres)`)
    .transform(sanitizeInput)
    .refine(
      val => !/<script[^>]*>.*?<\/script>/gi.test(val),
      'Conteúdo inválido detectado'
    );

/**
 * Schema de validação para agendamento público
 */
export const publicBookingSchema = z.object({
  nome_cliente: nameSchema,
  telefone: phoneSchema,
  email: emailSchema.optional().or(z.literal('')),
  endereco: addressSchema,
  bairro: z.string().min(2).max(100).transform(sanitizeInput),
  cidade: z.string().min(2).max(100).transform(sanitizeInput),
  cep: cepSchema.optional(),
  data_agendamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  valor_total: z.number().positive(),
  itens_carrinho: z.any(),
});

/**
 * Schema para lead de cupom
 */
export const leadCupomSchema = z.object({
  nome_completo: nameSchema,
  whatsapp: phoneSchema,
  bairro: z.string().min(2).max(100).transform(sanitizeInput),
  cidade: z.string().min(2).max(100).transform(sanitizeInput),
  cupom_codigo: z.string().max(50).transform(sanitizeInput),
});

/**
 * Schema para carrinho abandonado
 */
export const abandonedCartSchema = z.object({
  session_id: z.string().uuid(),
  nome_cliente: nameSchema.optional(),
  telefone: phoneSchema.optional(),
  email: emailSchema.optional(),
  endereco: addressSchema.optional(),
  bairro: z.string().max(100).transform(sanitizeInput).optional(),
  cidade: z.string().max(100).transform(sanitizeInput).optional(),
  cep: cepSchema.optional(),
  valor_total: z.number().nonnegative(),
  itens_carrinho: z.any(),
  etapa_abandonada: z.string().max(50).transform(sanitizeInput),
});

/**
 * Valida e sanitiza dados antes de enviar para API
 */
export function validateAndSanitize<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new Error(firstError.message);
    }
    throw error;
  }
}
