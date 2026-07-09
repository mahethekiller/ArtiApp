import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Switch, TextInput, Alert, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { AppButton } from '../components/atoms/Button';
import { useProfile } from '../hooks/useProfile';
import { useGallery } from '../hooks/useGallery';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Aarti } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';

export interface ProfileScreenProps {
  readonly navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const {
    profile,
    reminders,
    favoriteAartis,
    updateProfile,
    toggleReminder,
    addReminder,
    login,
    register,
    logout
  } = useProfile();

  const { savedWallpapers } = useGallery();
  const { currentAarti, isPlaying, togglePlay, loadAarti } = useAudioPlayer();

  // Editing profile details form state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGotra, setEditGotra] = useState('');
  const [editRashi, setEditRashi] = useState('');

  // Add reminder modal state
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('07:00 AM');

  // Authentication (login/register) modal state
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authIsRegistering, setAuthIsRegistering] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authGotra, setAuthGotra] = useState('');
  const [authRashi, setAuthRashi] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Load details into inputs when editing starts
  const startEditing = () => {
    if (profile) {
      setEditName(profile.name);
      setEditGotra(profile.gotra);
      setEditRashi(profile.rashi);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    const success = await updateProfile(editName, editGotra, editRashi);
    if (success) {
      setIsEditing(false);
      Alert.alert('Success', 'Spiritual profile updated successfully.');
    }
  };

  const handleAddReminder = async () => {
    if (!newReminderTitle.trim()) {
      Alert.alert('Error', 'Reminder name cannot be empty.');
      return;
    }
    const success = await addReminder(newReminderTitle, newReminderTime);
    if (success) {
      setReminderModalVisible(false);
      setNewReminderTitle('');
      Alert.alert('Success', 'Reminder set successfully.');
    }
  };

  const handleAuthSubmit = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert('Error', 'Email and password are required fields.');
      return;
    }
    if (authPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authIsRegistering) {
        await register({
          email: authEmail,
          password: authPassword,
          name: authName.trim() ? authName.trim() : undefined,
          gotra: authGotra.trim() ? authGotra.trim() : undefined,
          rashi: authRashi.trim() ? authRashi.trim() : undefined,
        });
        Alert.alert('Success', 'Spiritual account created successfully!');
      } else {
        await login({
          email: authEmail,
          password: authPassword,
        });
        Alert.alert('Success', 'Welcome back! Logged in successfully.');
      }
      setAuthModalVisible(false);
      resetAuthForm();
    } catch (e: any) {
      const errMsg = e.response?.data?.message || e.message || 'Authentication failed.';
      Alert.alert('Authentication Failed', errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const resetAuthForm = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthGotra('');
    setAuthRashi('');
  };

  const handlePlayPauseAarti = async (aarti: Aarti) => {
    if (currentAarti?.id === aarti.id) {
      await togglePlay();
    } else {
      await loadAarti(aarti, true);
    }
  };

  const playFavoriteAarti = (aarti: Aarti) => {
    navigation.navigate('AartiPlayer', { aartiId: aarti.id });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' }}
              style={styles.avatar}
            />
            <View style={styles.badge}>
              <AppText variant="labelSm" color={theme.colors.onSecondaryContainer} style={styles.badgeText}>
                {profile?.isGuest ? 'Guest' : 'Seeker'}
              </AppText>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                placeholder="Name"
                placeholderTextColor={theme.colors.outline}
                value={editName}
                onChangeText={setEditName}
                style={styles.inputField}
              />
              <TextInput
                placeholder="Gotra"
                placeholderTextColor={theme.colors.outline}
                value={editGotra}
                onChangeText={setEditGotra}
                style={styles.inputField}
              />
              <TextInput
                placeholder="Rashi"
                placeholderTextColor={theme.colors.outline}
                value={editRashi}
                onChangeText={setEditRashi}
                style={styles.inputField}
              />
              <View style={styles.editActions}>
                <AppButton title="Cancel" variant="outline" onPress={() => setIsEditing(false)} style={styles.editBtn} />
                <AppButton title="Save" variant="primary" onPress={handleSaveProfile} style={styles.editBtn} />
              </View>
            </View>
          ) : (
            <View style={styles.profileMeta}>
              <AppText variant="headlineMd" style={styles.profileName}>
                {profile?.name || 'Seeker of Peace'}
              </AppText>
              {profile?.isGuest ? (
                <AppText variant="labelSm" color={theme.colors.outline} style={styles.journeyText}>
                  Browsing as Guest Profile
                </AppText>
              ) : (
                <AppText variant="labelSm" color={theme.colors.primary} style={styles.journeyText}>
                  Spiritual Journey • Streak: {profile?.streakCount || 0} Days 🔥
                </AppText>
              )}

              {profile?.gotra || profile?.rashi ? (
                <View style={styles.spiritualDetailsRow}>
                  {profile.gotra ? (
                    <View style={styles.metaBadge}>
                      <AppText variant="labelSm" color={theme.colors.onSurfaceVariant}>
                        Gotra: {profile.gotra}
                      </AppText>
                    </View>
                  ) : null}
                  {profile.rashi ? (
                    <View style={styles.metaBadge}>
                      <AppText variant="labelSm" color={theme.colors.onSurfaceVariant}>
                        Rashi: {profile.rashi}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <AppButton
                title="Edit Spiritual Profile"
                variant="outline"
                style={styles.editProfileBtn}
                onPress={startEditing}
              />
            </View>
          )}
        </View>

        {/* Guest Account Info Banner */}
        {profile?.isGuest ? (
          <View style={styles.guestBanner}>
            <View style={styles.guestBannerHeader}>
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.tertiary} />
              <AppText variant="bodyLg" style={styles.guestBannerTitle}>
                Save Your Spiritual Progress
              </AppText>
            </View>
            <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.guestBannerText}>
              Create a permanent account or log in to sync your prayer streaks, reminders, and favorite Aartis across devices.
            </AppText>
            <View style={styles.guestActions}>
              <AppButton
                title="Log In"
                variant="outline"
                style={styles.guestBtn}
                onPress={() => {
                  setAuthIsRegistering(false);
                  setAuthModalVisible(true);
                }}
              />
              <AppButton
                title="Create Account"
                variant="primary"
                style={styles.guestBtn}
                onPress={() => {
                  setAuthIsRegistering(true);
                  setAuthModalVisible(true);
                }}
              />
            </View>
          </View>
        ) : null}

        {/* Favorite Aartis list */}
        <View style={styles.sectionHeader}>
          <AppText variant="bodyLg" style={styles.sectionTitle}>
            My Favorite Aartis
          </AppText>
          <Pressable onPress={() => navigation.navigate('Aarti')}>
            <AppText variant="labelSm" color={theme.colors.primary}>
              View All
            </AppText>
          </Pressable>
        </View>

        <View style={styles.favoritesContainer}>
          {favoriteAartis.length === 0 ? (
            <AppText variant="bodyMd" color={theme.colors.outline} style={styles.emptyText}>
              No favorites added yet. Explore the Aarti list!
            </AppText>
          ) : (
            favoriteAartis.map((aarti) => {
              const isThisPlaying = currentAarti?.id === aarti.id && isPlaying;
              return (
                <View key={aarti.id} style={styles.favAartiRow}>
                  <Ionicons name="heart" size={20} color={theme.colors.tertiary} />
                  <Pressable onPress={() => playFavoriteAarti(aarti)} style={styles.favAartiMeta}>
                    <AppText variant="bodyMd" style={styles.favAartiTitle}>
                      {aarti.title}
                    </AppText>
                    <AppText variant="labelSm" color={theme.colors.onSurfaceVariant}>
                      {aarti.subtitle}
                    </AppText>
                  </Pressable>
                  <Pressable onPress={() => handlePlayPauseAarti(aarti)} style={styles.playPauseBtn}>
                    <Ionicons
                      name={isThisPlaying ? "pause-circle" : "play-circle-outline"}
                      size={28}
                      color={theme.colors.primary}
                    />
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        {/* Saved Wallpapers Grid */}
        <View style={styles.sectionHeader}>
          <AppText variant="bodyLg" style={styles.sectionTitle}>
            Saved Wallpapers
          </AppText>
          <Pressable onPress={() => navigation.navigate('Gallery')}>
            <AppText variant="labelSm" color={theme.colors.primary}>
              Gallery
            </AppText>
          </Pressable>
        </View>

        <View style={styles.wallpaperGrid}>
          {savedWallpapers.length === 0 ? (
            <AppText variant="bodyMd" color={theme.colors.outline} style={styles.emptyText}>
              No wallpapers saved yet. Explore the Gallery!
            </AppText>
          ) : (
            savedWallpapers.map((wp) => (
              <Image key={wp.id} source={{ uri: wp.imageUrl }} style={styles.gridImage} />
            ))
          )}
        </View>

        {/* Daily reminders alerts toggle */}
        <View style={styles.remindersBox}>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderTitleWrapper}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
              <AppText variant="bodyLg" style={styles.reminderBoxTitle}>
                Daily Reminders
              </AppText>
            </View>
            <AppText variant="labelSm" color={theme.colors.outline}>
              Stay consistent in devotion
            </AppText>
          </View>

          {reminders.map((rem) => (
            <View key={rem.id} style={styles.reminderRow}>
              <View>
                <AppText variant="bodyMd" style={styles.reminderName}>
                  {rem.title}
                </AppText>
                <AppText variant="labelSm" color={theme.colors.outline}>
                  {rem.time}
                </AppText>
              </View>
              <Switch
                value={rem.isEnabled}
                onValueChange={(val) => { toggleReminder(rem.id, val); }}
                trackColor={{ false: theme.colors.surfaceDim, true: theme.colors.primaryFixed }}
                thumbColor={rem.isEnabled ? theme.colors.primaryContainer : theme.colors.outline}
              />
            </View>
          ))}

          <AppButton
            title="Add New Reminder"
            variant="secondary"
            icon={<Ionicons name="add" size={18} color={theme.colors.onSecondaryContainer} />}
            style={styles.addReminderBtn}
            onPress={() => setReminderModalVisible(true)}
          />
        </View>

        {/* Action Options */}
        <View style={styles.actionsBox}>
          <Pressable style={styles.actionRow} onPress={() => Alert.alert('Prayer History', 'History database connected successfully.')}>
            <View style={styles.actionLeft}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <AppText variant="bodyMd" style={styles.actionLabel}>Prayer History</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
          </Pressable>

          <Pressable style={styles.actionRow} onPress={() => Alert.alert('Contribution', 'Thank you for your support!')}>
            <View style={styles.actionLeft}>
              <Ionicons name="ribbon-outline" size={20} color={theme.colors.primary} />
              <AppText variant="bodyMd" style={styles.actionLabel}>Contribution</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
          </Pressable>

          <Pressable
            style={styles.actionRow}
            onPress={async () => {
              await logout();
              Alert.alert('Logged Out', 'You are now browsing with a guest profile.');
            }}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.tertiary} />
              <AppText variant="bodyMd" style={styles.actionLabel} color={theme.colors.tertiary}>
                {profile?.isGuest ? 'Reset Guest Cache' : 'Log Out'}
              </AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Auth Register/Login Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={authModalVisible}
        onRequestClose={() => {
          if (!authLoading) {
            setAuthModalVisible(false);
            resetAuthForm();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.scrollModalContainer} style={{ width: '100%' }}>
            <View style={styles.modalContent}>
              <AppText variant="headlineMd" style={styles.modalTitle}>
                {authIsRegistering ? 'Create Devotional Account' : 'Welcome Back'}
              </AppText>

              {authIsRegistering ? (
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor={theme.colors.outline}
                  value={authName}
                  onChangeText={setAuthName}
                  editable={!authLoading}
                  style={styles.modalInput}
                />
              ) : null}

              <TextInput
                placeholder="Email Address"
                placeholderTextColor={theme.colors.outline}
                value={authEmail}
                onChangeText={setAuthEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!authLoading}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="Password (Min 8 chars)"
                placeholderTextColor={theme.colors.outline}
                value={authPassword}
                onChangeText={setAuthPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                editable={!authLoading}
                style={styles.modalInput}
              />

              {authIsRegistering ? (
                <>
                  <TextInput
                    placeholder="Gotra (Optional)"
                    placeholderTextColor={theme.colors.outline}
                    value={authGotra}
                    onChangeText={setAuthGotra}
                    editable={!authLoading}
                    style={styles.modalInput}
                  />
                  <TextInput
                    placeholder="Rashi (Optional)"
                    placeholderTextColor={theme.colors.outline}
                    value={authRashi}
                    onChangeText={setAuthRashi}
                    editable={!authLoading}
                    style={styles.modalInput}
                  />
                </>
              ) : null}

              <View style={styles.modalActions}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  style={styles.modalBtn}
                  disabled={authLoading}
                  onPress={() => {
                    setAuthModalVisible(false);
                    resetAuthForm();
                  }}
                />
                {authLoading ? (
                  <View style={styles.modalLoaderContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  </View>
                ) : (
                  <AppButton
                    title={authIsRegistering ? 'Sign Up' : 'Log In'}
                    variant="primary"
                    style={styles.modalBtn}
                    onPress={handleAuthSubmit}
                  />
                )}
              </View>

              <Pressable
                onPress={() => {
                  if (!authLoading) {
                    setAuthIsRegistering(prev => !prev);
                  }
                }}
                disabled={authLoading}
                style={styles.toggleAuthModeBtn}
              >
                <AppText variant="bodyMd" color={theme.colors.primary} style={styles.toggleAuthModeText}>
                  {authIsRegistering
                    ? 'Already have an account? Log In'
                    : "Don't have an account? Sign Up"}
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Reminder Modal popup */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reminderModalVisible}
        onRequestClose={() => setReminderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AppText variant="headlineMd" style={styles.modalTitle}>Set Spiritual Reminder</AppText>
            
            <TextInput
              placeholder="Reminder Name (e.g. Evening Bhajan)"
              placeholderTextColor={theme.colors.outline}
              value={newReminderTitle}
              onChangeText={setNewReminderTitle}
              style={styles.modalInput}
            />

            <TextInput
              placeholder="Time (e.g. 06:30 PM)"
              placeholderTextColor={theme.colors.outline}
              value={newReminderTime}
              onChangeText={setNewReminderTime}
              style={styles.modalInput}
            />

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                style={styles.modalBtn}
                onPress={() => setReminderModalVisible(false)}
              />
              <AppButton
                title="Add Alarm"
                variant="primary"
                style={styles.modalBtn}
                onPress={handleAddReminder}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.containerMargin,
    paddingBottom: theme.spacing.gutter,
  },
  profileHeaderCard: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.gutter,
    alignItems: 'center',
    marginVertical: theme.spacing.gutter,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: theme.colors.primaryContainer,
  },
  badge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  profileMeta: {
    alignItems: 'center',
    width: '100%',
  },
  profileName: {
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
  journeyText: {
    marginTop: 4,
    fontWeight: theme.typography.weights.semibold,
  },
  spiritualDetailsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    justifyContent: 'center',
  },
  metaBadge: {
    backgroundColor: theme.colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  editProfileBtn: {
    marginTop: 14,
    height: 36,
    width: 200,
  },
  editForm: {
    width: '100%',
    gap: 10,
  },
  inputField: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    height: 42,
    borderRadius: theme.borderRadius.default,
    paddingHorizontal: theme.spacing.gutter,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    color: theme.colors.onSurface,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
  },
  editBtn: {
    flex: 1,
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.gutter,
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  favoritesContainer: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  favAartiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.gutter,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  favAartiMeta: {
    flex: 1,
    marginLeft: 12,
  },
  favAartiTitle: {
    fontWeight: theme.typography.weights.semibold,
  },
  playPauseBtn: {
    padding: 4,
  },
  wallpaperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridImage: {
    width: (Dimensions.get('window').width - 48 - 16) / 3,
    height: 120,
    borderRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.surfaceDim,
  },
  emptyText: {
    textAlign: 'center',
    width: '100%',
    paddingVertical: 20,
  },
  remindersBox: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.gutter,
    marginTop: theme.spacing.gutter,
    elevation: 1,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  reminderHeader: {
    marginBottom: theme.spacing.gutter,
  },
  reminderTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  reminderBoxTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  reminderName: {
    fontWeight: theme.typography.weights.semibold,
  },
  addReminderBtn: {
    marginTop: theme.spacing.gutter,
    height: 40,
  },
  actionsBox: {
    marginTop: theme.spacing.gutter,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
    marginBottom: theme.spacing.gutter,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.gutter,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainer,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontWeight: theme.typography.weights.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 23, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.gutter,
  },
  scrollModalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.gutter,
    elevation: 5,
    gap: theme.spacing.gutter,
  },
  modalTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    height: 46,
    borderRadius: theme.borderRadius.default,
    paddingHorizontal: theme.spacing.gutter,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    color: theme.colors.onSurface,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
  },
  modalLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  guestBanner: {
    backgroundColor: theme.colors.tertiaryContainer,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.gutter,
    marginBottom: theme.spacing.gutter,
    borderWidth: 1,
    borderColor: theme.colors.tertiary,
  },
  guestBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  guestBannerTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.onTertiaryContainer,
  },
  guestBannerText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  guestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  guestBtn: {
    flex: 1,
    height: 38,
  },
  toggleAuthModeBtn: {
    marginTop: 8,
    alignItems: 'center',
  },
  toggleAuthModeText: {
    fontSize: 13,
    fontWeight: theme.typography.weights.semibold,
  },
});
