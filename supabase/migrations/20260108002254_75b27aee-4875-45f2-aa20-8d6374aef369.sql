-- Create enum types for the finance app
CREATE TYPE public.status_pagamento AS ENUM ('pago', 'nao_pago');
CREATE TYPE public.tipo_fluxo AS ENUM ('entrada', 'saida');
CREATE TYPE public.classificacao AS ENUM ('gasto', 'divida', 'despesa', 'investimento');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  valor_estimado DECIMAL(12,2),
  data_pagamento DATE NOT NULL,
  status_pagamento public.status_pagamento NOT NULL DEFAULT 'nao_pago',
  tipo_fluxo public.tipo_fluxo NOT NULL,
  classificacao public.classificacao NOT NULL,
  tags TEXT[] DEFAULT '{}',
  mes_referencia TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this app)
CREATE POLICY "Allow all read access" 
ON public.transactions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow all insert access" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all update access" 
ON public.transactions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow all delete access" 
ON public.transactions 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();