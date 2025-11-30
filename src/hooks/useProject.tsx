import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  persona: string | null;
  product_idea: string | null;
  target_audience: string | null;
  key_problem: string | null;
  canvas_data: Record<string, string>;
  progress: Record<string, number>;
  validated_blocks: string[];
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useProject = (projectId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all projects for user
  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for the JSONB fields
      const typedData = (data || []).map(p => ({
        ...p,
        canvas_data: (p.canvas_data || {}) as Record<string, string>,
        progress: (p.progress || {}) as Record<string, number>,
        validated_blocks: (p.validated_blocks || []) as string[],
      }));
      
      setProjects(typedData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch single project
  const fetchProject = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        const typedData = {
          ...data,
          canvas_data: (data.canvas_data || {}) as Record<string, string>,
          progress: (data.progress || {}) as Record<string, number>,
          validated_blocks: (data.validated_blocks || []) as string[],
        };
        setProject(typedData);

        // Update last accessed
        await supabase
          .from('projects')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  }, [user]);

  // Create new project
  const createProject = async (projectData: {
    name: string;
    persona?: string;
    product_idea?: string;
    target_audience?: string;
    key_problem?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          persona: projectData.persona || null,
          product_idea: projectData.product_idea || null,
          target_audience: projectData.target_audience || null,
          key_problem: projectData.key_problem || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        canvas_data: (data.canvas_data || {}) as Record<string, string>,
        progress: (data.progress || {}) as Record<string, number>,
        validated_blocks: (data.validated_blocks || []) as string[],
      };

      setProjects(prev => [typedData, ...prev]);
      return typedData;
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Auto-save project with debounce
  const saveProject = useCallback(async (updates: Partial<Project>) => {
    if (!user || !project) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce save by 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        const { error } = await supabase
          .from('projects')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', project.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setProject(prev => prev ? { ...prev, ...updates } : null);
      } catch (error) {
        console.error('Error saving project:', error);
      } finally {
        setSaving(false);
      }
    }, 1000);
  }, [user, project]);

  // Delete project
  const deleteProject = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
      toast({
        title: 'Project deleted',
        description: 'Your project has been removed.',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    } else {
      fetchProjects();
    }
  }, [projectId, fetchProject, fetchProjects]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    project,
    projects,
    loading,
    saving,
    createProject,
    saveProject,
    deleteProject,
    fetchProjects,
    setProject,
  };
};
