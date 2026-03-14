import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthStore {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  checkAdminStatus: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAdmin: false,
  loading: true,
  setUser: (user) => {
    // 초기 설정 시 기본적인 메타데이터 확인
    const isAdmin = !!user && (
      user.app_metadata?.role === 'admin'
    );
    
    set({ user, isAdmin, loading: false });
    
    // 만약 유저가 로그인했는데 isAdmin이 아직 false라면 DB 재확인
    if (user && !isAdmin) {
      get().checkAdminStatus(user.id);
    }
  },
  setLoading: (loading) => set({ loading }),
  
  /**
   * DB의 profiles 테이블을 조회하여 최신 권한 정보를 가져옵니다.
   */
  checkAdminStatus: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        set({ isAdmin: data.role === 'admin' });
      }
    } catch (err) {
      console.warn('Failed to check admin status or profile not found:', err);
    }
  },

  /**
   * 로그아웃 처리
   */
  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, isAdmin: false, loading: false });
    } catch (err) {
      console.error('Logout error:', err);
      set({ loading: false });
    }
  }
}));
