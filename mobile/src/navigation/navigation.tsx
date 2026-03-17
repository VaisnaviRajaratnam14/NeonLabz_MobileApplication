import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TaskFormScreen } from "../features/tasks/screens/TaskFormScreen";
import { TaskListScreen } from "../features/tasks/screens/TaskListScreen";
import { Task } from "../features/tasks/types/task";

export type RootStackParamList = {
  TaskList: undefined;
  TaskForm: { mode: "add" } | { mode: "edit"; task: Task };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right"
        }}
      >
        <Stack.Screen name="TaskList" component={TaskListScreen} />
        <Stack.Screen name="TaskForm" component={TaskFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
