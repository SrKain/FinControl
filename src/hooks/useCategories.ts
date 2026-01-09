import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  color: string;
  target_percentage: number;
  user_id: string;
}

export interface CategoryWithStats extends Category {
  actual_amount: number;
  actual_percentage: number;
  deviation: number; // positive = over budget, negative = under budget
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;

      setCategories((data || []).map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        target_percentage: Number(row.target_percentage) || 0,
        user_id: row.user_id,
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (category: Omit<Category, 'id' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return null;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name.trim(),
          color: category.color,
          target_percentage: category.target_percentage,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe uma categoria com esse nome');
        } else {
          throw error;
        }
        return null;
      }

      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        target_percentage: Number(data.target_percentage) || 0,
        user_id: data.user_id,
      };

      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Categoria criada!');
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Erro ao criar categoria');
      return null;
    }
  }, []);

  const updateCategory = useCallback(async (id: string, updates: Partial<Omit<Category, 'id' | 'user_id'>>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: updates.name?.trim(),
          color: updates.color,
          target_percentage: updates.target_percentage,
        })
        .eq('id', id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe uma categoria com esse nome');
        } else {
          throw error;
        }
        return false;
      }

      setCategories(prev => prev.map(c =>
        c.id === id ? { ...c, ...updates } : c
      ).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Categoria atualizada!');
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
      return false;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Categoria excluída!');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
      return false;
    }
  }, []);

  const getTotalTargetPercentage = useCallback(() => {
    return categories.reduce((sum, c) => sum + c.target_percentage, 0);
  }, [categories]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getTotalTargetPercentage,
    refetch: fetchCategories,
  };
}
