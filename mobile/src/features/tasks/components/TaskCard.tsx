import { memo, useEffect, useRef } from "react";
import { Alert, Animated, PanResponder, Text, TouchableOpacity, View } from "react-native";
import { Task } from "../types/task";

type TaskCardProps = {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

const formatDueDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

const formatTimeRange = (startTime?: string, endTime?: string) => {
  if (!startTime && !endTime) {
    return "Time not set";
  }

  return `${startTime ?? "--:--"} - ${endTime ?? "--:--"}`;
};

const toLocalDay = (isoDate: string) => {
  const datePart = isoDate.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getDueReminder = (isoDate: string) => {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDay = toLocalDay(isoDate);
  const dayDiff = Math.round((dueDay.getTime() - todayStart.getTime()) / 86400000);

  if (dayDiff < 0) {
    return {
      text: "Finished",
      containerClass: "bg-emerald-100",
      textClass: "text-emerald-700"
    };
  }

  if (dayDiff === 0) {
    return {
      text: "Due today",
      containerClass: "bg-orangeTheme-100",
      textClass: "text-orangeTheme-600"
    };
  }

  return {
    text: dayDiff === 1 ? "1 day left" : `${dayDiff} days left`,
    containerClass: "bg-blueTheme-50",
    textClass: "text-blueTheme-700"
  };
};

const TaskCardComponent = ({ task, index, onEdit, onDelete }: TaskCardProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const isRemoving = useRef(false);
  const reminder = getDueReminder(task.dueDate);

  const animateDelete = () => {
    if (isRemoving.current) {
      return;
    }

    isRemoving.current = true;
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -420,
        duration: 220,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true
      })
    ]).start(() => {
      onDelete(task._id);
    });
  };

  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      friction: 7,
      tension: 80,
      useNativeDriver: true
    }).start();
  };

  const confirmDelete = (onConfirm: () => void, onCancel?: () => void) => {
    Alert.alert("Delete task?", `Are you sure you want to delete "${task.title}"?`, [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          onCancel?.();
        }
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onConfirm
      }
    ]);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return Math.abs(gestureState.dx) > 8 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (isRemoving.current) {
          return;
        }

        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -130));
        }
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (isRemoving.current) {
          return;
        }

        if (gestureState.dx < -95) {
          confirmDelete(animateDelete, resetPosition);
          return;
        }

        resetPosition();
      }
    })
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        delay: Math.min(index * 70, 280),
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 360,
        delay: Math.min(index * 70, 280),
        useNativeDriver: true
      })
    ]).start();
  }, [index, opacity, translateY]);

  return (
    <View className="mb-3 overflow-hidden rounded-2xl">
      <View className="absolute inset-0 items-end justify-center rounded-2xl bg-orangeTheme-500 pr-5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-white">Release to delete</Text>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        className="rounded-3xl border p-4"
        style={{
          backgroundColor: "#0a8993",
          borderColor: "rgba(255,255,255,0.18)",
          opacity,
          transform: [{ translateY }, { translateX }]
        }}
      >
        <View className="mb-2 flex-row items-start justify-between gap-3">
          <Text className="flex-1 text-base font-semibold text-white">{task.title}</Text>
          <View className="items-end">
            <Text className="text-xs font-medium text-teal-50">{formatDueDate(task.dueDate)}</Text>
            <View className={`mt-1 rounded-full px-2 py-1 ${reminder.containerClass}`}>
              <Text className={`text-[11px] font-semibold ${reminder.textClass}`}>{reminder.text}</Text>
            </View>
          </View>
        </View>

        <Text className="mb-4 text-sm text-teal-50">{task.description}</Text>

        <View className="mb-4 rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.14)" }}>
          <Text className="text-xs font-semibold uppercase tracking-wide text-teal-100">Time</Text>
          <Text className="mt-1 text-sm font-medium text-white">{formatTimeRange(task.startTime, task.endTime)}</Text>
        </View>

        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => onEdit(task)}
            className="flex-1 rounded-xl border px-3 py-2"
            style={{ borderColor: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.17)" }}
          >
            <Text className="text-center font-semibold text-white">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => confirmDelete(animateDelete)}
            className="flex-1 rounded-xl border px-3 py-2"
            style={{ borderColor: "rgba(248,113,113,0.5)", backgroundColor: "rgba(220,38,38,0.16)" }}
          >
            <Text className="text-center font-semibold text-red-100">Delete</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export const TaskCard = memo(TaskCardComponent);
