import ThemeButton from '@/components/ThemeButton';
import { themes, usePersistentTheme } from '@/context/usePersistentTheme';
import React, {useEffect, useState} from 'react';
import {View, Text, Switch, Pressable, Alert, ScrollView} from 'react-native';
import api from '@/services/AxiosInstance';

const SettingsPage = () => {
  const [allowsAdultContent, setAllowsAdultContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        console.log("fetching settings")
        const response = await api.get('/users/me/settings');
        setAllowsAdultContent(response.data.allowsAdultContent);
        setHasChanges(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const onToggle = async (onState: boolean) => {
    setAllowsAdultContent(onState);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await api.put('/users/me/settings', { allowsAdultContent }); 

      Alert.alert('Saved', 'Your settings have been updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save settings';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
      setHasChanges(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-5">
      <Text className="text-2xl font-semibold text-onSurface mb-6">Settings</Text>

      <View className="rounded-2xl border border-surfaceVariant bg-surface p-5 mb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-base font-medium text-onSurface">Allow adult content</Text>
            <Text className="text-sm text-onSurface">Enable this option to see adult content.</Text>
          </View>

          <Switch
            value={allowsAdultContent}
            onValueChange={onToggle}
            trackColor={{false: themes.dark['--color-onSurface'], true: themes.dark['--color-primary']}}
            thumbColor={allowsAdultContent ? themes.dark['--color-onSurface'] : themes.dark['--color-onSurface']}
            activeThumbColor={allowsAdultContent ? themes.dark['--color-onSurface'] : themes.dark['--color-onSurface']}
          />
        </View>
      </View>

      <ThemeButton
        onPress={handleSave}
        disabled={saving || !hasChanges}
        mode="contained"
        className="w-fit self-end"
      >
        {saving ? 'Saving…' : 'Save settings'}
      </ThemeButton>
    </ScrollView>
  );
};

export default SettingsPage;
