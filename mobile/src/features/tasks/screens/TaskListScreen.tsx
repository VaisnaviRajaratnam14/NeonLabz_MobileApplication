import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LottieView from "lottie-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Toast from "react-native-toast-message";
import { AppLoader } from "../../../shared/components/AppLoader";
import { TaskCard } from "../components/TaskCard";
import { taskApi } from "../services/taskApi";
import { Task } from "../types/task";
import { RootStackParamList } from "../../../navigation/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "TaskList">;

const getDateKey = (isoDate: string) => new Date(isoDate).toISOString().slice(0, 10);

const formatCurrentDate = () =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).format(new Date());

const formatFilterDay = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return {
    dayNumber: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date),
    dayLabel: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
  };
};

const getComparableTime = (time?: string) => {
  if (!time || typeof time !== "string") {
    return "99:99";
  }

  return time;
};

const getTaskDayDiff = (isoDate: string) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(isoDate);
  const dueStart = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  return Math.round((dueStart.getTime() - todayStart.getTime()) / 86400000);
};

export const TaskListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(-18)).current;
  const fabScale = useRef(new Animated.Value(0.9)).current;
  const fabPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(headerTranslate, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 6,
        tension: 90,
        useNativeDriver: true
      })
    ]).start();

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [fabPulse, fabScale, headerOpacity, headerTranslate]);

  const fetchTasks = useCallback(async () => {
    const data = await taskApi.getTasks();
    setTasks(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          setIsLoading(true);
          await fetchTasks();
        } finally {
          setIsLoading(false);
        }
      };

      void load();
    }, [fetchTasks])
  );

  const onRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await fetchTasks();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTasks]);

  const onDelete = useCallback(async (taskId: string) => {
    await taskApi.deleteTask(taskId);
    setTasks((previous) => previous.filter((task) => task._id !== taskId));

    Toast.show({
      type: "success",
      text1: "Task deleted"
    });
  }, []);

  const onEdit = useCallback(
    (task: Task) => {
      navigation.navigate("TaskForm", { mode: "edit", task });
    },
    [navigation]
  );

  const onAdd = useCallback(() => {
    navigation.navigate("TaskForm", { mode: "add" });
  }, [navigation]);

  const onCloseApp = useCallback(() => {
    Alert.alert("Close app?", "Do you want to close the application?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Close",
        style: "destructive",
        onPress: () => BackHandler.exitApp()
      }
    ]);
  }, []);

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((left, right) => {
        const dueDateDiff = new Date(left.dueDate).getTime() - new Date(right.dueDate).getTime();

        if (dueDateDiff !== 0) {
          return dueDateDiff;
        }

        return getComparableTime(left.startTime).localeCompare(getComparableTime(right.startTime));
      }),
    [tasks]
  );

  const dateFilters = useMemo(() => {
    const uniqueDates = Array.from(new Set(sortedTasks.map((task) => getDateKey(task.dueDate))));
    return ["all", ...uniqueDates];
  }, [sortedTasks]);

  const filteredTasks = useMemo(() => {
    if (selectedDate === "all") {
      return sortedTasks;
    }

    return sortedTasks.filter((task) => getDateKey(task.dueDate) === selectedDate);
  }, [selectedDate, sortedTasks]);

  const selectedDateLabel = useMemo(() => {
    if (selectedDate === "all") {
      return `All Tasks • ${sortedTasks.length}`;
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long"
    }).format(new Date(`${selectedDate}T00:00:00`));
  }, [selectedDate, sortedTasks.length]);

  const summary = useMemo(() => {
    let inProgress = 0;
    let upcoming = 0;
    let finished = 0;

    filteredTasks.forEach((task) => {
      const diff = getTaskDayDiff(task.dueDate);
      if (diff < 0) {
        finished += 1;
      } else if (diff === 0) {
        inProgress += 1;
      } else {
        upcoming += 1;
      }
    });

    return { inProgress, upcoming, finished, total: filteredTasks.length };
  }, [filteredTasks]);

  const emptyState = useMemo(
    () => (
      <View className="mt-24 items-center px-8">
        <Text className="mb-2 text-xl font-semibold text-white">
          {selectedDate === "all" ? "No tasks yet" : "No tasks for this day"}
        </Text>
        <Text className="text-center text-teal-50">
          {selectedDate === "all"
            ? "Start by adding your first task and track your deadlines clearly."
            : "Choose another date or tap All to see every task."}
        </Text>
      </View>
    ),
    [selectedDate]
  );

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#cfe5fb" }}>
      <Animated.View
        className="px-5 pb-2 pt-14"
        style={{
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslate }]
        }}
      >
        <View className="rounded-[30px] bg-white px-5 pb-5 pt-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date())}
            </Text>
            <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">100%</Text>
          </View>

          <View className="mt-4 flex-row items-end justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-4xl font-bold leading-tight text-blueTheme-900">Let's start</Text>
              <Text className="-mt-1 text-4xl font-bold leading-tight text-blueTheme-900">work</Text>
              <Text className="mt-2 text-sm font-medium text-slate-500">Keep focus with your daily task board</Text>
            </View>

            <View
              className="h-24 w-24 items-center justify-center rounded-3xl"
              style={{ backgroundColor: "#eaf2ff" }}
            >
              <LottieView
                source={require("../../../assets/animations/girl.json")}
                autoPlay
                loop
                style={{ width: 92, height: 92 }}
              />
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-blueTheme-50 px-4 py-3">
            <Text className="text-xs font-bold uppercase tracking-[1.4px] text-blueTheme-700">
              {selectedDateLabel}
            </Text>
            <Text className="text-sm font-extrabold text-blueTheme-900">{summary.total} Tasks</Text>
          </View>

          <View className="absolute right-5 top-4 flex-row gap-2">
            <TouchableOpacity
              onPress={onCloseApp}
              className="h-10 w-10 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#f43f5e" }}
            >
              <Text className="text-xl font-bold text-white">×</Text>
            </TouchableOpacity>

            <Animated.View
              style={{
                transform: [{ scale: fabScale }, { scale: fabPulse }]
              }}
            >
              <TouchableOpacity
                onPress={onAdd}
                className="h-10 w-10 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#19a2f2" }}
              >
                <Text className="text-2xl font-bold text-white">+</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      <View
        className="relative mt-4 flex-1 overflow-hidden"
        style={{ borderTopLeftRadius: 38, borderTopRightRadius: 38 }}
      >
        <View className="absolute inset-x-0 top-0 h-[46%]" style={{ backgroundColor: "#13cdc2" }} />
        <View className="absolute inset-x-0 bottom-0 top-[46%]" style={{ backgroundColor: "#0ea5a4" }} />

        <View className="flex-1 px-4 pt-6">
          <View
            className="self-start rounded-2xl px-4 py-2"
            style={{ backgroundColor: "#0b5f74" }}
          >
            <Text className="text-base font-extrabold uppercase tracking-[1.8px] text-white">1st Week</Text>
          </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 14, paddingBottom: 8, paddingRight: 6 }}
        >
          {dateFilters.map((filter) => {
            const isActive = selectedDate === filter;

            if (filter === "all") {
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setSelectedDate("all")}
                  className="mr-3 items-center justify-center rounded-full px-4 py-3"
                  style={{
                    backgroundColor: isActive ? "#0b5f74" : "rgba(255,255,255,0.2)",
                    minWidth: 70
                  }}
                >
                  <Text className="text-sm font-bold text-white">ALL</Text>
                </TouchableOpacity>
              );
            }

            const { dayNumber, dayLabel } = formatFilterDay(filter);

            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedDate(filter)}
                className="mr-3 items-center justify-center rounded-full px-3 py-2"
                style={{
                  backgroundColor: isActive ? "#f5feff" : "rgba(8,92,110,0.38)",
                  minWidth: 52,
                  height: 64
                }}
              >
                <Text
                  className="text-base font-extrabold"
                  style={{ color: isActive ? "#08748c" : "#e6fdff" }}
                >
                  {dayNumber}
                </Text>
                <Text
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: isActive ? "#0aa0ba" : "#ccfbff" }}
                >
                  {dayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text className="mt-3 px-2 text-base font-extrabold uppercase tracking-[1.6px] text-white">Today</Text>

        <View className="mt-3 flex-row gap-3 px-2">
          <View className="flex-1 rounded-2xl px-3 py-3" style={{ backgroundColor: "rgba(8,92,110,0.35)" }}>
            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-teal-100">In Progress</Text>
            <Text className="mt-1 text-2xl font-extrabold text-white">{summary.inProgress}</Text>
          </View>
          <View className="flex-1 rounded-2xl px-3 py-3" style={{ backgroundColor: "rgba(8,92,110,0.28)" }}>
            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-teal-100">Upcoming</Text>
            <Text className="mt-1 text-2xl font-extrabold text-white">{summary.upcoming}</Text>
          </View>
          <View className="flex-1 rounded-2xl px-3 py-3" style={{ backgroundColor: "rgba(8,92,110,0.2)" }}>
            <Text className="text-[11px] font-bold uppercase tracking-[1.3px] text-teal-100">Finished</Text>
            <Text className="mt-1 text-2xl font-extrabold text-white">{summary.finished}</Text>
          </View>
        </View>

          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => (
              <TaskCard task={item} index={index} onEdit={onEdit} onDelete={onDelete} />
            )}
            contentContainerStyle={{ padding: 10, paddingTop: 14, paddingBottom: 30, flexGrow: 1 }}
            ListEmptyComponent={emptyState}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={10}
            removeClippedSubviews
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#ffffff" />
            }
          />
        </View>
      </View>
    </View>
  );
};
