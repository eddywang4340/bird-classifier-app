import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Identify',
          tabBarIcon: ({ color }) => <MaterialIcons name="camera" size={24} color={color} />,
          headerTitle: 'Bird Classifier'
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <MaterialIcons name="history" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
