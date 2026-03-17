import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Animated, Easing, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../../../navigation/navigation";
import { taskApi } from "../services/taskApi";
import { TaskFormData, taskSchema } from "../validation/taskSchema";

type Props = NativeStackScreenProps<RootStackParamList, "TaskForm">;

const toDateInput = (isoDate: string) => isoDate.split("T")[0] ?? "";
const toTimeInput = (value?: string) => value ?? "";

const formatDateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateInput = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return new Date();
};

const formatTimeInput = (date: Date) => {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

const parseTimeInput = (value: string) => {
  const date = new Date();

  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  } else {
    date.setHours(9, 0, 0, 0);
  }

  return date;
};

type PickerType = "dueDate" | "startTime" | "endTime";

export const TaskFormScreen = ({ route, navigation }: Props) => {
  const isEdit = route.params.mode === "edit";
  const existingTask = route.params.mode === "edit" ? route.params.task : null;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(24)).current;
  const [activePicker, setActivePicker] = useState<PickerType | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 450,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 450,
        delay: 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      })
    ]).start();
  }, [cardOpacity, cardTranslate, headerOpacity]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: existingTask?.title ?? "",
      description: existingTask?.description ?? "",
      dueDate: existingTask?.dueDate ? toDateInput(existingTask.dueDate) : "",
      startTime: toTimeInput(existingTask?.startTime),
      endTime: toTimeInput(existingTask?.endTime)
    }
  });

  const onSubmit = async (values: TaskFormData) => {
    const payload = {
      ...values,
      dueDate: new Date(`${values.dueDate}T00:00:00.000Z`).toISOString()
    };

    if (isEdit && existingTask) {
      await taskApi.updateTask(existingTask._id, payload);
      Toast.show({ type: "success", text1: "Task updated" });
    } else {
      await taskApi.createTask(payload);
      Toast.show({ type: "success", text1: "Task created" });
    }

    navigation.goBack();
  };

  const closePicker = () => setActivePicker(null);

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate: Date | undefined,
    onChange: (value: string) => void
  ) => {
    if (event.type === "dismissed") {
      closePicker();
      return;
    }

    if (selectedDate) {
      onChange(formatDateInput(selectedDate));
    }

    closePicker();
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime: Date | undefined,
    onChange: (value: string) => void
  ) => {
    if (event.type === "dismissed") {
      closePicker();
      return;
    }

    if (selectedTime) {
      onChange(formatTimeInput(selectedTime));
    }

    closePicker();
  };

  return (
    <ScrollView className="flex-1 bg-cream-100" contentContainerStyle={{ paddingBottom: 40 }}>
      <Animated.View className="bg-blueTheme-700 px-5 pb-6 pt-14" style={{ opacity: headerOpacity }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, alignSelf: "flex-start" }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8
            }}
          >
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold", lineHeight: 22 }}>{"‹"}</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">{isEdit ? "Edit Task" : "Create Task"}</Text>
        <Text className="mt-1 text-cream-100">
          {isEdit ? "Update details and keep momentum" : "Capture what matters and keep moving"}
        </Text>
      </Animated.View>

      <Animated.View
        className="mx-4 -mt-5 rounded-2xl border border-blueTheme-100 bg-white p-4"
        style={{
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslate }]
        }}
      >
        <Text className="mb-2 text-sm font-semibold text-blueTheme-900">Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ship mobile feature"
              className="rounded-xl border border-blueTheme-100 bg-cream-50 px-4 py-3 text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.title ? <Text className="mt-1 text-xs text-red-600">{errors.title.message}</Text> : null}

        <Text className="mb-2 mt-4 text-sm font-semibold text-blueTheme-900">Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Brief details about the task"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="min-h-28 rounded-xl border border-blueTheme-100 bg-cream-50 px-4 py-3 text-slate-900"
              placeholderTextColor="#94a3b8"
            />
          )}
        />
        {errors.description ? (
          <Text className="mt-1 text-xs text-red-600">{errors.description.message}</Text>
        ) : null}

        <Text className="mb-2 mt-4 text-sm font-semibold text-blueTheme-900">Due Date (YYYY-MM-DD)</Text>
        <Controller
          control={control}
          name="dueDate"
          render={({ field: { value, onChange, onBlur } }) => (
            <>
              <TouchableOpacity
                onPress={() => setActivePicker("dueDate")}
                onBlur={onBlur}
                className="rounded-xl border border-blueTheme-100 bg-cream-50 px-4 py-3"
              >
                <Text className={`${value ? "text-slate-900" : "text-slate-400"}`}>
                  {value || "Select due date"}
                </Text>
              </TouchableOpacity>

              {activePicker === "dueDate" ? (
                <DateTimePicker
                  value={parseDateInput(value)}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => handleDateChange(event, selectedDate, onChange)}
                />
              ) : null}
            </>
          )}
        />
        {errors.dueDate ? <Text className="mt-1 text-xs text-red-600">{errors.dueDate.message}</Text> : null}

        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-blueTheme-900">Start Time (HH:MM)</Text>
            <Controller
              control={control}
              name="startTime"
              render={({ field: { value, onChange, onBlur } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setActivePicker("startTime")}
                    onBlur={onBlur}
                    className="rounded-xl border border-blueTheme-100 bg-cream-50 px-4 py-3"
                  >
                    <Text className={`${value ? "text-slate-900" : "text-slate-400"}`}>
                      {value || "Select start time"}
                    </Text>
                  </TouchableOpacity>

                  {activePicker === "startTime" ? (
                    <DateTimePicker
                      value={parseTimeInput(value)}
                      mode="time"
                      is24Hour
                      display="default"
                      onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, onChange)}
                    />
                  ) : null}
                </>
              )}
            />
            {errors.startTime ? <Text className="mt-1 text-xs text-red-600">{errors.startTime.message}</Text> : null}
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-sm font-semibold text-blueTheme-900">End Time (HH:MM)</Text>
            <Controller
              control={control}
              name="endTime"
              render={({ field: { value, onChange, onBlur } }) => (
                <>
                  <TouchableOpacity
                    onPress={() => setActivePicker("endTime")}
                    onBlur={onBlur}
                    className="rounded-xl border border-blueTheme-100 bg-cream-50 px-4 py-3"
                  >
                    <Text className={`${value ? "text-slate-900" : "text-slate-400"}`}>
                      {value || "Select end time"}
                    </Text>
                  </TouchableOpacity>

                  {activePicker === "endTime" ? (
                    <DateTimePicker
                      value={parseTimeInput(value)}
                      mode="time"
                      is24Hour
                      display="default"
                      onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, onChange)}
                    />
                  ) : null}
                </>
              )}
            />
            {errors.endTime ? <Text className="mt-1 text-xs text-red-600">{errors.endTime.message}</Text> : null}
          </View>
        </View>

        <TouchableOpacity
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="mt-6 rounded-xl bg-orangeTheme-500 px-4 py-4"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-center text-base font-bold text-white">
              {isEdit ? "Save Changes" : "Create Task"}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};
