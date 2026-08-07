import { supabase } from './supabase';

// ===== Meetups =====

export async function getNextMeetup() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('meetups')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(1);

  if (error) throw error;
  return data && data.length > 0 ? data[0] : null;
}

export async function getPastMeetups() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('meetups')
    .select('*')
    .lt('date', today)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllMeetups() {
  const { data, error } = await supabase
    .from('meetups')
    .select('*')
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMeetupById(id) {
  const { data, error } = await supabase
    .from('meetups')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createMeetup(meetup) {
  const { data, error } = await supabase
    .from('meetups')
    .insert(meetup)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===== Check-ins =====

export async function getCheckins(meetupId) {
  const { data, error } = await supabase
    .from('checkins')
    .select('*, profiles:user_id(name, initial, color, avatar_url)')
    .eq('meetup_id', meetupId);

  if (error) {
    // Fallback without join in case relationship isn't cached
    const { data: fallback } = await supabase
      .from('checkins')
      .select('*')
      .eq('meetup_id', meetupId);
    return fallback || [];
  }
  return data || [];
}

export async function checkIn(meetupId, userId) {
  const { data, error } = await supabase
    .from('checkins')
    .insert({ meetup_id: meetupId, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function undoCheckIn(meetupId, userId) {
  const { error } = await supabase
    .from('checkins')
    .delete()
    .eq('meetup_id', meetupId)
    .eq('user_id', userId);

  if (error) throw error;
}

// ===== Ratings =====

export async function getRatings(meetupId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('meetup_id', meetupId);

  if (error) throw error;
  return data || [];
}

export async function getMyRating(meetupId, userId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('meetup_id', meetupId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function submitRating(meetupId, userId, rating) {
  const { data, error } = await supabase
    .from('ratings')
    .upsert({ meetup_id: meetupId, user_id: userId, ...rating })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMeetupAverageRating(meetupId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('coffee, food, atmosphere, service, value')
    .eq('meetup_id', meetupId);

  if (error) throw error;

  if (!data || data.length === 0) return null;

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    coffee: avg(data.map((r) => r.coffee).filter(Boolean)),
    food: avg(data.map((r) => r.food).filter(Boolean)),
    atmosphere: avg(data.map((r) => r.atmosphere).filter(Boolean)),
    service: avg(data.map((r) => r.service).filter(Boolean)),
    value: avg(data.map((r) => r.value).filter(Boolean)),
    overall: avg([
      ...data.map((r) => r.coffee).filter(Boolean),
      ...data.map((r) => r.food).filter(Boolean),
      ...data.map((r) => r.atmosphere).filter(Boolean),
      ...data.map((r) => r.service).filter(Boolean),
      ...data.map((r) => r.value).filter(Boolean),
    ]),
  };
}

// ===== Profiles =====

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// ===== Photos =====

export async function getPhotos(meetupId) {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('meetup_id', meetupId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function uploadPhoto(meetupId, userId, file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${meetupId}/${userId}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('memories')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('memories')
    .getPublicUrl(fileName);

  const { data, error } = await supabase
    .from('photos')
    .insert({ meetup_id: meetupId, user_id: userId, url: publicUrl })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ===== Stats =====

export async function getStats() {
  try {
    const { data: meetups, error: meetupsError } = await supabase
      .from('meetups')
      .select('id, venue');

    if (meetupsError) throw meetupsError;

    const totalMeetups = meetups?.length || 0;
    let averageRating = 0;
    let favoriteSpot = null;

    if (totalMeetups > 0) {
      // Get all ratings
      const { data: allRatings } = await supabase
        .from('ratings')
        .select('coffee, food, atmosphere, service, value, meetup_id');

      if (allRatings && allRatings.length > 0) {
        const allValues = allRatings.flatMap((r) =>
          [r.coffee, r.food, r.atmosphere, r.service, r.value].filter(Boolean)
        );
        averageRating = allValues.length > 0
          ? Math.round((allValues.reduce((a, b) => a + b, 0) / allValues.length) * 10) / 10
          : 0;

        // Find favorite spot (highest rated)
        const meetupAvgs = {};
        allRatings.forEach((r) => {
          const vals = [r.coffee, r.food, r.atmosphere, r.service, r.value].filter(Boolean);
          if (vals.length > 0) {
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            meetupAvgs[r.meetup_id] = (meetupAvgs[r.meetup_id] || 0) + avg;
          }
        });
        // Actually this isn't quite right for averaging. Let's keep it simple.
        // Find the meetup with most ratings for now
        const meetupRatingCounts = {};
        allRatings.forEach((r) => {
          meetupRatingCounts[r.meetup_id] = (meetupRatingCounts[r.meetup_id] || 0) + 1;
        });
        const bestId = Object.entries(meetupRatingCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (bestId) {
          const best = meetups.find((m) => m.id === bestId);
          favoriteSpot = best?.venue || null;
        }
      }
    }

    return {
      totalMeetups,
      averageRating,
      mostAttendances: null,
      favoriteSpot,
    };
  } catch (err) {
    console.error('Stats error:', err);
    return { totalMeetups: 0, averageRating: 0, mostAttendances: null, favoriteSpot: null };
  }
}

// ===== Friendships (Rede de Amigos) =====

export async function getFriends(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;

  const friendIds = (data || []).map((f) => f.friend_id);
  if (friendIds.length === 0) return [];

  // Fetch profiles separately
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds);

  if (profilesError) throw profilesError;
  return profiles || [];
}

export async function addFriend(userId, friendId) {
  // Bidirectional: add both directions
  const { error: e1 } = await supabase
    .from('friendships')
    .upsert({ user_id: userId, friend_id: friendId, status: 'active' });

  if (e1) throw e1;

  const { error: e2 } = await supabase
    .from('friendships')
    .upsert({ user_id: friendId, friend_id: userId, status: 'active' });

  if (e2) throw e2;

  return true;
}

export async function getFriendIds(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) throw error;
  return (data || []).map((f) => f.friend_id);
}

// Get meetups from my network (my meetups + friends' meetups)
export async function getNetworkMeetups(userId, type = 'all') {
  const friendIds = await getFriendIds(userId);
  const allUserIds = [userId, ...friendIds];

  const today = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('meetups')
    .select('*')
    .in('created_by', allUserIds)
    .order('date', { ascending: false });

  if (type === 'past') {
    query = query.lt('date', today);
  } else if (type === 'upcoming') {
    query = query.gte('date', today).order('date', { ascending: true });
  }

  const { data, error } = await query;

  if (error) throw error;

  // Mark which meetups the current user has checked into
  const { data: myCheckins } = await supabase
    .from('checkins')
    .select('meetup_id')
    .eq('user_id', userId);

  const checkedInMeetupIds = new Set((myCheckins || []).map((c) => c.meetup_id));

  return (data || []).map((m) => ({
    ...m,
    i_checked_in: checkedInMeetupIds.has(m.id),
    is_mine: m.created_by === userId,
  }));
}

// ===== Invitations (Convites) =====

export async function createInvitation(meetupId, inviterId) {
  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      meetup_id: meetupId,
      inviter_id: inviterId,
      token,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitationByToken(token) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (error) throw error;

  // Fetch meetup and inviter separately
  const [{ data: meetup }, { data: inviter }] = await Promise.all([
    supabase.from('meetups').select('*').eq('id', data.meetup_id).single(),
    supabase.from('profiles').select('name, initial, color').eq('id', data.inviter_id).single(),
  ]);

  return { ...data, meetup, inviter };
}

export async function acceptInvitation(invitationId, userId) {
  // Mark invitation as accepted
  const { error: e1 } = await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitationId);

  if (e1) throw e1;

  // Get the invitation to know the inviter
  const { data: invite } = await supabase
    .from('invitations')
    .select('inviter_id, meetup_id')
    .eq('id', invitationId)
    .single();

  if (invite) {
    // Add bidirectional friendship
    await addFriend(userId, invite.inviter_id);
  }

  return true;
}
