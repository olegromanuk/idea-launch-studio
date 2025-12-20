-- Create development submission status enum
CREATE TYPE public.dev_submission_status AS ENUM (
  'submitted',
  'review',
  'development',
  'testing',
  'deployment',
  'completed',
  'on_hold',
  'cancelled'
);

-- Create hosting platform enum
CREATE TYPE public.hosting_platform AS ENUM (
  'vercel',
  'netlify',
  'aws',
  'azure',
  'gcp',
  'digitalocean',
  'docker',
  'kubernetes',
  'custom_server',
  'other'
);

-- Create development submissions table
CREATE TABLE public.dev_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  
  -- Project info
  project_name TEXT NOT NULL,
  project_description TEXT,
  
  -- Scope selection (JSON to store selected features/stories)
  selected_scope JSONB NOT NULL DEFAULT '{}',
  
  -- Hosting configuration
  hosting_platform hosting_platform NOT NULL,
  hosting_notes TEXT,
  
  -- GitHub configuration
  github_option TEXT NOT NULL CHECK (github_option IN ('existing', 'new_repo')),
  github_repo_url TEXT,
  github_username TEXT NOT NULL,
  
  -- Development options
  enable_cicd BOOLEAN NOT NULL DEFAULT false,
  cicd_platform TEXT,
  enable_testing BOOLEAN NOT NULL DEFAULT false,
  enable_monitoring BOOLEAN NOT NULL DEFAULT false,
  enable_ssl BOOLEAN NOT NULL DEFAULT true,
  custom_domain TEXT,
  environment_type TEXT DEFAULT 'production' CHECK (environment_type IN ('development', 'staging', 'production')),
  
  -- Additional notes
  additional_requirements TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Status tracking
  status dev_submission_status NOT NULL DEFAULT 'submitted',
  status_notes TEXT,
  assigned_to TEXT,
  estimated_completion DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create status history table for tracking changes
CREATE TABLE public.dev_submission_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.dev_submissions(id) ON DELETE CASCADE,
  old_status dev_submission_status,
  new_status dev_submission_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin domains table for configurable admin access
CREATE TABLE public.admin_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial admin domain
INSERT INTO public.admin_domains (domain) VALUES ('gmail.com');

-- Enable RLS on all tables
ALTER TABLE public.dev_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_submission_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_domains ENABLE ROW LEVEL SECURITY;

-- Function to check if user is admin by email domain
CREATE OR REPLACE FUNCTION public.is_admin_by_domain()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_domains ad
    WHERE ad.is_active = true
      AND ad.domain = split_part(auth.jwt() ->> 'email', '@', 2)
  )
$$;

-- RLS Policies for dev_submissions
-- Users can view their own submissions
CREATE POLICY "Users can view own submissions"
ON public.dev_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.dev_submissions
FOR SELECT
USING (public.is_admin_by_domain());

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions"
ON public.dev_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "Users can update own pending submissions"
ON public.dev_submissions
FOR UPDATE
USING (auth.uid() = user_id AND status = 'submitted');

-- Admins can update all submissions
CREATE POLICY "Admins can update all submissions"
ON public.dev_submissions
FOR UPDATE
USING (public.is_admin_by_domain());

-- Users can delete their own pending submissions
CREATE POLICY "Users can delete own pending submissions"
ON public.dev_submissions
FOR DELETE
USING (auth.uid() = user_id AND status = 'submitted');

-- RLS Policies for status history
CREATE POLICY "Users can view history of own submissions"
ON public.dev_submission_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dev_submissions ds
    WHERE ds.id = submission_id AND ds.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all history"
ON public.dev_submission_status_history
FOR SELECT
USING (public.is_admin_by_domain());

CREATE POLICY "Admins can insert history"
ON public.dev_submission_status_history
FOR INSERT
WITH CHECK (public.is_admin_by_domain());

-- RLS for admin_domains (admins only)
CREATE POLICY "Admins can view domains"
ON public.admin_domains
FOR SELECT
USING (public.is_admin_by_domain());

CREATE POLICY "Admins can manage domains"
ON public.admin_domains
FOR ALL
USING (public.is_admin_by_domain());

-- Trigger to update updated_at
CREATE TRIGGER update_dev_submissions_updated_at
BEFORE UPDATE ON public.dev_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Trigger to log status changes
CREATE OR REPLACE FUNCTION public.log_submission_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.dev_submission_status_history (submission_id, old_status, new_status, changed_by, notes)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NEW.status_notes);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_submission_status_change_trigger
AFTER UPDATE ON public.dev_submissions
FOR EACH ROW
EXECUTE FUNCTION public.log_submission_status_change();