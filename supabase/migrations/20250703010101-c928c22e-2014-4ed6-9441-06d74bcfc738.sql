-- Create servers table
CREATE TABLE public.servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_server_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL,
  icon_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  last_bump TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create bump_logs table to track bumps
CREATE TABLE public.bump_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_id UUID REFERENCES public.servers(id) ON DELETE CASCADE NOT NULL,
  user_id TEXT NOT NULL, -- Discord user ID
  bumped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_profiles table for Discord users
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  discord_id TEXT NOT NULL UNIQUE,
  discord_username TEXT NOT NULL,
  discord_avatar TEXT,
  server_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bump_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for servers
CREATE POLICY "Anyone can view active servers" 
ON public.servers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can create their own servers" 
ON public.servers 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own servers" 
ON public.servers 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own servers" 
ON public.servers 
FOR DELETE 
USING (auth.uid() = owner_id);

-- RLS Policies for bump_logs
CREATE POLICY "Anyone can view bump logs" 
ON public.bump_logs 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert bump logs" 
ON public.bump_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles" 
ON public.user_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to cleanup inactive servers
CREATE OR REPLACE FUNCTION public.cleanup_inactive_servers()
RETURNS void AS $$
BEGIN
  UPDATE public.servers 
  SET is_active = false 
  WHERE last_bump < now() - interval '7 days' 
  AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_servers_last_bump ON public.servers(last_bump DESC);
CREATE INDEX idx_servers_member_count ON public.servers(member_count DESC);
CREATE INDEX idx_servers_tags ON public.servers USING GIN(tags);
CREATE INDEX idx_servers_discord_id ON public.servers(discord_server_id);
CREATE INDEX idx_bump_logs_server_id ON public.bump_logs(server_id);
CREATE INDEX idx_bump_logs_user_id ON public.bump_logs(user_id);
CREATE INDEX idx_bump_logs_bumped_at ON public.bump_logs(bumped_at DESC);