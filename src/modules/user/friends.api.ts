// ============================================// Friends API Methods// ============================================
import { supabase } from '@/lib/supabase';
import type { ApiResponse } from '@/lib/api-client';

// 好友关系类型
export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

// 好友信息类型
export interface FriendInfo {
  id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_id: string;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  request_status: 'sent' | 'received' | 'accepted' | 'blocked';
}

/**
 * 发送好友请求
 * @param friendId 好友的用户ID
 */
export async function sendFriendRequest(friendId: string): Promise<ApiResponse<Friendship>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  // 检查是否已经存在好友关系
  const { data: existing } = await supabase
    .from('friends')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`)
    .single();

  if (existing) {
    return { data: null, error: { message: 'Friendship already exists', code: 'CONFLICT' } };
  }

  const { data, error } = await supabase
    .from('friends')
    .insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending'
    })
    .select()
    .single();

  return { data, error };
}

/**
 * 接受好友请求
 * @param friendshipId 好友关系ID
 */
export async function acceptFriendRequest(friendshipId: string): Promise<ApiResponse<Friendship>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted' })
    .eq('id', friendshipId)
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .select()
    .single();

  return { data, error };
}

/**
 * 拒绝好友请求
 * @param friendshipId 好友关系ID
 */
export async function declineFriendRequest(friendshipId: string): Promise<ApiResponse<Friendship>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'blocked' })
    .eq('id', friendshipId)
    .eq('friend_id', user.id)
    .eq('status', 'pending')
    .select()
    .single();

  return { data, error };
}

/**
 * 获取好友列表
 * @param status 可选的状态过滤
 */
export async function getFriends(status?: 'pending' | 'accepted' | 'blocked'): Promise<ApiResponse<FriendInfo[]>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  let query = supabase
    .from('user_friends')
    .select('*');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * 获取收到的好友请求
 */
export async function getFriendRequests(): Promise<ApiResponse<FriendInfo[]>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { data, error } = await supabase
    .from('user_friends')
    .select('*')
    .eq('request_status', 'received');

  return { data, error };
}

/**
 * 删除好友关系
 * @param friendshipId 好友关系ID
 */
export async function removeFriend(friendshipId: string): Promise<ApiResponse<any>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('id', friendshipId);

  return { data: null, error };
}

/**
 * 搜索用户
 * @param query 搜索关键词（用户名或昵称）
 */
export async function searchUsers(query: string): Promise<ApiResponse<any[]>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' } };

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .or(`ilike(nickname, '%${query}%')`)
    .neq('id', user.id)
    .limit(20);

  return { data, error };
}
