import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;

      setTags((data || []).map(row => ({
        id: row.id,
        name: row.name,
        color: row.color,
        user_id: row.user_id,
      })));
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = useCallback(async (tag: Omit<Tag, 'id' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado');
        return null;
      }

      const { data, error } = await supabase
        .from('tags')
        .insert({
          name: tag.name.trim(),
          color: tag.color,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe uma tag com esse nome');
        } else {
          throw error;
        }
        return null;
      }

      const newTag: Tag = {
        id: data.id,
        name: data.name,
        color: data.color,
        user_id: data.user_id,
      };

      setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Tag criada!');
      return newTag;
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Erro ao criar tag');
      return null;
    }
  }, []);

  const updateTag = useCallback(async (id: string, updates: Partial<Omit<Tag, 'id' | 'user_id'>>) => {
    try {
      const { error } = await supabase
        .from('tags')
        .update({
          name: updates.name?.trim(),
          color: updates.color,
        })
        .eq('id', id);

      if (error) {
        if (error.code === '23505') {
          toast.error('Já existe uma tag com esse nome');
        } else {
          throw error;
        }
        return false;
      }

      setTags(prev => prev.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Tag atualizada!');
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Erro ao atualizar tag');
      return false;
    }
  }, []);

  const deleteTag = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTags(prev => prev.filter(t => t.id !== id));
      toast.success('Tag excluída!');
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Erro ao excluir tag');
      return false;
    }
  }, []);

  return {
    tags,
    loading,
    addTag,
    updateTag,
    deleteTag,
    refetch: fetchTags,
  };
}
