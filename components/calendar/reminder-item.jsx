// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Switch,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Button,
//   FlatList,
// } from "react-native";
// import { COLORS, SIZES } from "@/constants";
// import { useSelector } from "@legendapp/state/react";
// import { preferenceState } from "@/legendstate/AmpelaStates";
// import * as BackgroundFetch from "expo-background-fetch";
// import * as TaskManager from "expo-task-manager";
// import * as Notifications from "expo-notifications";

// const PILL_REMINDER_TASK = "PILL_REMINDER_TASK";
// const OVULATION_REMINDER_TASK = "OVULATION_REMINDER_TASK";
// const MENSTRUATION_REMINDER_TASK = "MENSTRUATION_REMINDER_TASK";

// TaskManager.defineTask(PILL_REMINDER_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// TaskManager.defineTask(OVULATION_REMINDER_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// TaskManager.defineTask(MENSTRUATION_REMINDER_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// const scheduleNotification = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   const now = new Date();
//   const notificationTime = new Date(notificationDate);

//   if (notificationTime > now) {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: title,
//         body: body,
//         data: { someData: "goes here" },
//       },
//       trigger: { date: notificationTime },
//     });

//     const nextNotificationTime = new Date(notificationTime);
//     switch (frequency) {
//       case "quotidien":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
//         break;
//       case "hebdomadaire":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
//         break;
//       case "chaquedeuxjours":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 2);
//         break;
//       case "chaquetroisjours":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 3);
//         break;
//       default:
//         break;
//     }

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   }
// };

// const registerPillReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   return await registerTask(
//     PILL_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerOvulationReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   return await registerTask(
//     OVULATION_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerMenstruationReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   return await registerTask(
//     MENSTRUATION_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerTask = async (
//   taskName,
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   const status = await BackgroundFetch.getStatusAsync();
//   if (
//     status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
//     status === BackgroundFetch.BackgroundFetchStatus.Denied
//   ) {
//     console.log("Background execution is restricted or denied.");
//     return;
//   }

//   const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

//   if (!isRegistered) {
//     return BackgroundFetch.registerTaskAsync(taskName, {
//       minimumInterval: 1 * 60,
//       stopOnTerminate: false,
//       startOnBoot: true,
//       data: { notificationDate, title, body, frequency },
//     });
//   } else {
//     return BackgroundFetch.unregisterTaskAsync(taskName);
//   }
// };

// const ReminderItem = ({ as, time, howmanytimeReminder }) => {
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const { theme } = useSelector(() => preferenceState.get());
//   const [selectedFrequency, setSelectedFrequency] = useState("quotidien");

//   const toggleSwitch = async () => {
//     const notificationDate = new Date();
//     notificationDate.setHours(time.hour);
//     notificationDate.setMinutes(time.minutes);

//     let message;
//     let registerFunction;
//     let taskName;

//     switch (as) {
//       case "Prise de pilule":
//         message = "Vous devez prendre votre pilule";
//         registerFunction = registerPillReminderTask;
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         message = "Votre jour d'ovulation est le";
//         registerFunction = registerOvulationReminderTask;
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }

//     const newState = !isEnabled;
//     setIsEnabled(newState);

//     if (newState) {
//       await registerFunction(
//         notificationDate.toISOString(),
//         as,
//         message,
//         selectedFrequency
//       );
//     } else {
//       await BackgroundFetch.unregisterTaskAsync(taskName);
//     }
//   };

//   const frequencyOptions = [
//     { label: "Quotidien", value: "quotidien" },
//     { label: "Hebdomadaire", value: "hebdomadaire" },
//     { label: "Chaque deux jours", value: "chaquedeuxjours" },
//     { label: "Chaque trois jours", value: "chaquetroisjours" },
//   ];

//   const renderFrequencyItem = ({ item }) => {
//     const isSelected = item.value === selectedFrequency;
//     const itemStyle = isSelected
//       ? styles.selectedFrequency
//       : styles.regularFrequency;
//     return (
//       <TouchableOpacity onPress={() => setSelectedFrequency(item.value)}>
//         <Text style={[itemStyle, { color: isSelected ? "white" : "black" }]}>
//           {item.label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View>
//       <TouchableOpacity
//         onPress={() => setModalVisible(true)}
//         style={styles.container}
//         className="shadow-sm shadow-black"
//       >
//         <View style={styles.left}>
//           <Text style={styles.textRegular}>{as}</Text>
//           <Text style={styles.textRegular}>
//             Rappeler: {howmanytimeReminder}
//           </Text>
//         </View>
//         <View>
//           <Switch
//             trackColor={{
//               false: theme === "pink" ? COLORS.neutral200 : COLORS.neutral250,
//               true: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
//             }}
//             thumbColor={isEnabled ? COLORS.neutral100 : COLORS.neutral100}
//             ios_backgroundColor={COLORS.neutral200}
//             onValueChange={toggleSwitch}
//             value={isEnabled}
//           />
//         </View>
//       </TouchableOpacity>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(!modalVisible)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalView} className="p-3 py-5">
//             <Text className="text-[18px] text-center mb-10">{as}</Text>
//             <Text className="mb-3">Périodicité</Text>
//             <FlatList
//               data={frequencyOptions}
//               renderItem={renderFrequencyItem}
//               keyExtractor={(item) => item.value}
//               contentContainerStyle={{ marginBottom: 20 }}
//             />
//             <Button
//               title="Terminer"
//               onPress={() => setModalVisible(false)}
//               color={COLORS.accent500}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   selectedFrequency: {
//     backgroundColor: COLORS.accent600,
//     color: COLORS.white,
//     padding: 10,
//     borderRadius: 5,
//   },
//   regularFrequency: {
//     backgroundColor: COLORS.neutral100,
//     color: "black",
//     padding: 10,
//     borderRadius: 5,
//   },
//   container: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: COLORS.neutral100,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginVertical: 2,
//   },
//   left: {
//     gap: 12,
//     alignItems: "flex-start",
//   },
//   time: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginLeft: 20,
//   },
//   textRegular: {
//     fontFamily: "Regular",
//     fontSize: SIZES.medium,
//   },
//   textMedium: {
//     fontFamily: "Medium",
//     fontSize: SIZES.large,
//   },
//   modalContainer: {
//     backgroundColor: "rgba(0,0,0,0.5)",
//     height: SIZES.height,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalView: {
//     backgroundColor: "white",
//     width: SIZES.width - 40,
//     minHeight: SIZES.height * 0.3,
//     borderRadius: 5,
//   },
// });

// export default ReminderItem;

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Switch,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Button,
//   FlatList,
// } from "react-native";
// import { COLORS, SIZES } from "@/constants";
// import { useSelector } from "@legendapp/state/react";
// import { preferenceState } from "@/legendstate/AmpelaStates";
// import * as BackgroundFetch from "expo-background-fetch";
// import * as TaskManager from "expo-task-manager";
// import * as Notifications from "expo-notifications";

// const PILL_REMINDER_TASK = "PILL_REMINDER_TASK";
// const OVULATION_REMINDER_TASK = "OVULATION_REMINDER_TASK";
// const MENSTRUATION_REMINDER_TASK = "MENSTRUATION_REMINDER_TASK";

// TaskManager.defineTask(PILL_REMINDER_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// TaskManager.defineTask(OVULATION_REMINDER_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// TaskManager.defineTask(MENSTRUATION_REMINDER_TASK, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// // Modified scheduleNotification function for immediate testing
// const scheduleNotification = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   const now = new Date();
//   const notificationTime = new Date(notificationDate);

//   // Immediate notification for testing
//   if (notificationTime > now || frequency === "immediate") {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: title,
//         body: body,
//         data: { someData: "goes here" },
//       },
//       trigger: { seconds: 5 }, // Trigger notification after 5 seconds for testing
//     });

//     const nextNotificationTime = new Date(notificationTime);
//     switch (frequency) {
//       case "quotidien":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
//         break;
//       case "hebdomadaire":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
//         break;
//       case "chaquedeuxjours":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 2);
//         break;
//       case "chaquetroisjours":
//         nextNotificationTime.setDate(nextNotificationTime.getDate() + 3);
//         break;
//       default:
//         break;
//     }

//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   }
// };

// const registerPillReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   return await registerTask(
//     PILL_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerOvulationReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   return await registerTask(
//     OVULATION_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerMenstruationReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   return await registerTask(
//     MENSTRUATION_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerTask = async (
//   taskName,
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   const status = await BackgroundFetch.getStatusAsync();
//   if (
//     status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
//     status === BackgroundFetch.BackgroundFetchStatus.Denied
//   ) {
//     console.log("Background execution is restricted or denied.");
//     return;
//   }

//   const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

//   if (!isRegistered) {
//     return BackgroundFetch.registerTaskAsync(taskName, {
//       minimumInterval: 1 * 60,
//       stopOnTerminate: false,
//       startOnBoot: true,
//       data: { notificationDate, title, body, frequency },
//     });
//   } else {
//     return BackgroundFetch.unregisterTaskAsync(taskName);
//   }
// };

// const ReminderItem = ({ as, time, howmanytimeReminder }) => {
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const { theme } = useSelector(() => preferenceState.get());
//   const [selectedFrequency, setSelectedFrequency] = useState("quotidien");

//   const checkTaskStatus = async (taskName) => {
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
//     setIsEnabled(isRegistered);
//   };

//   useEffect(() => {
//     let taskName;
//     switch (as) {
//       case "Prise de pilule":
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }
//     checkTaskStatus(taskName);
//   }, [as]);

//   const toggleSwitch = async () => {
//     const notificationDate = new Date();
//     notificationDate.setHours(time.hour);
//     notificationDate.setMinutes(time.minutes);

//     let message;
//     let registerFunction;
//     let taskName;

//     switch (as) {
//       case "Prise de pilule":
//         message = "Vous devez prendre votre pilule";
//         registerFunction = registerPillReminderTask;
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         message = "Votre jour d'ovulation est le";
//         registerFunction = registerOvulationReminderTask;
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }

//     const newState = !isEnabled;
//     setIsEnabled(newState);

//     if (newState) {
//       // Using immediate frequency for testing
//       await registerFunction(
//         notificationDate.toISOString(),
//         as,
//         message,
//         "immediate"
//       );
//     } else {
//       await BackgroundFetch.unregisterTaskAsync(taskName);
//     }
//   };

//   const frequencyOptions = [
//     { label: "Quotidien", value: "quotidien" },
//     { label: "Hebdomadaire", value: "hebdomadaire" },
//     { label: "Chaque deux jours", value: "chaquedeuxjours" },
//     { label: "Chaque trois jours", value: "chaquetroisjours" },
//   ];

//   const renderFrequencyItem = ({ item }) => {
//     const isSelected = item.value === selectedFrequency;
//     const itemStyle = isSelected
//       ? styles.selectedFrequency
//       : styles.regularFrequency;
//     return (
//       <TouchableOpacity onPress={() => setSelectedFrequency(item.value)}>
//         <Text style={[itemStyle, { color: isSelected ? "white" : "black" }]}>
//           {item.label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View>
//       <TouchableOpacity
//         onPress={() => setModalVisible(true)}
//         style={styles.container}
//         className="shadow-sm shadow-black"
//       >
//         <View style={styles.left}>
//           <Text style={styles.textRegular}>{as}</Text>
//           <Text style={styles.textRegular}>
//             Rappeler: {howmanytimeReminder}
//           </Text>
//         </View>
//         <View>
//           <Switch
//             trackColor={{
//               false: theme === "pink" ? COLORS.neutral200 : COLORS.neutral250,
//               true: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
//             }}
//             thumbColor={isEnabled ? COLORS.neutral100 : COLORS.neutral100}
//             ios_backgroundColor={COLORS.neutral200}
//             onValueChange={toggleSwitch}
//             value={isEnabled}
//           />
//         </View>
//       </TouchableOpacity>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(!modalVisible)}
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalView} className="p-3 py-5">
//             <Text className="text-[18px] text-center mb-10">{as}</Text>
//             <Text className="mb-3">Périodicité</Text>
//             <FlatList
//               data={frequencyOptions}
//               renderItem={renderFrequencyItem}
//               keyExtractor={(item) => item.value}
//               contentContainerStyle={{ marginBottom: 20 }}
//             />
//             <Button
//               title="Terminer"
//               onPress={() => setModalVisible(false)}
//               color={COLORS.accent500}
//             />
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   selectedFrequency: {
//     backgroundColor: COLORS.accent600,
//     color: COLORS.white,
//     padding: 10,
//     borderRadius: 5,
//   },
//   regularFrequency: {
//     backgroundColor: COLORS.neutral100,
//     color: "black",
//     padding: 10,
//     borderRadius: 5,
//   },
//   container: {
//     display: "flex",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: COLORS.neutral100,
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginVertical: 2,
//   },
//   left: {
//     gap: 12,
//     alignItems: "flex-start",
//   },
//   time: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginLeft: 20,
//   },
//   textRegular: {
//     fontFamily: "Regular",
//     fontSize: SIZES.medium,
//   },
//   textMedium: {
//     fontFamily: "Medium",
//     fontSize: SIZES.large,
//   },
//   modalContainer: {
//     backgroundColor: "rgba(0,0,0,0.5)",
//     height: SIZES.height,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   modalView: {
//     backgroundColor: "white",
//     width: SIZES.width - 40,
//     minHeight: SIZES.height * 0.3,
//     borderRadius: 5,
//   },
// });

// export default ReminderItem;

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Switch,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Button,
//   FlatList,
// } from "react-native";
// import { COLORS, SIZES } from "@/constants";
// import { useSelector } from "@legendapp/state/react";
// import { preferenceState } from "@/legendstate/AmpelaStates";
// import * as BackgroundFetch from "expo-background-fetch";
// import * as TaskManager from "expo-task-manager";
// import * as Notifications from "expo-notifications";

// const PILL_REMINDER_TASK = "PILL_REMINDER_TASK";
// const OVULATION_REMINDER_TASK = "OVULATION_REMINDER_TASK";
// const MENSTRUATION_REMINDER_TASK = "MENSTRUATION_REMINDER_TASK";

// TaskManager.defineTask(PILL_REMINDER_TASK, async ({ data, error }) => {
//   console.log("PILL_REMINDER_TASK executed");
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// TaskManager.defineTask(OVULATION_REMINDER_TASK, async ({ data, error }) => {
//   console.log("OVULATION_REMINDER_TASK executed");
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// TaskManager.defineTask(MENSTRUATION_REMINDER_TASK, async ({ data, error }) => {
//   console.log("MENSTRUATION_REMINDER_TASK executed");
//   if (error) {
//     console.error(error);
//     return;
//   }

//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// });

// const scheduleNotification = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   console.log("scheduleNotification called", {
//     notificationDate,
//     title,
//     body,
//     frequency,
//   });

//   const now = new Date();
//   const notificationTime = new Date(notificationDate);

//   // Immediate notification for testing
//   // if (notificationTime > now || frequency === "immediate") {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title: title,
//       body: body,
//       data: { someData: "goes here" },
//     },
//     trigger: { seconds: 5 },
//   });

//   console.log("Notification scheduled");

//   const nextNotificationTime = new Date(notificationTime);
//   switch (frequency) {
//     case "quotidien":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
//       break;
//     case "hebdomadaire":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
//       break;
//     case "chaquedeuxjours":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 2);
//       break;
//     case "chaquetroisjours":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 3);
//       break;
//     default:
//       break;
//   }

//   return BackgroundFetch.BackgroundFetchResult.NewData;
//   // }
// };

// const registerPillReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   console.log("registerPillReminderTask called");
//   return await registerTask(
//     PILL_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerOvulationReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   console.log("registerOvulationReminderTask called");
//   return await registerTask(
//     OVULATION_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerMenstruationReminderTask = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   console.log("registerMenstruationReminderTask called");
//   return await registerTask(
//     MENSTRUATION_REMINDER_TASK,
//     notificationDate,
//     title,
//     body,
//     frequency
//   );
// };

// const registerTask = async (
//   taskName,
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   console.log("registerTask called", {
//     taskName,
//     notificationDate,
//     title,
//     body,
//     frequency,
//   });

//   const status = await BackgroundFetch.getStatusAsync();
//   if (
//     status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
//     status === BackgroundFetch.BackgroundFetchStatus.Denied
//   ) {
//     console.log("Background execution is restricted or denied.");
//     return;
//   }

//   const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);

//   if (!isRegistered) {
//     console.log("Registering task", taskName);
//     return BackgroundFetch.registerTaskAsync(taskName, {
//       minimumInterval: 1 * 60,
//       stopOnTerminate: false,
//       startOnBoot: true,
//       data: { notificationDate, title, body, frequency },
//     });
//   } else {
//     console.log("Unregistering task", taskName);
//     return BackgroundFetch.unregisterTaskAsync(taskName);
//   }
// };

// const ReminderItem = ({ as, time, howmanytimeReminder }) => {
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const { theme } = useSelector(() => preferenceState.get());
//   const [selectedFrequency, setSelectedFrequency] = useState("quotidien");

//   const checkTaskStatus = async (taskName) => {
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
//     setIsEnabled(isRegistered);
//     console.log("Task status checked", taskName, isRegistered);
//   };

//   useEffect(() => {
//     let taskName;
//     switch (as) {
//       case "Prise de pilule":
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }
//     checkTaskStatus(taskName);
//   }, [as]);

//   const toggleSwitch = async () => {
//     console.log("toggleSwitch called");
//     const notificationDate = new Date();
//     notificationDate.setHours(time.hour);
//     notificationDate.setMinutes(time.minutes);

//     let message;
//     let registerFunction;
//     let taskName;

//     switch (as) {
//       case "Prise de pilule":
//         message = "Vous devez prendre votre pilule";
//         registerFunction = registerPillReminderTask;
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         message = "Votre jour d'ovulation est le";
//         registerFunction = registerOvulationReminderTask;
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }

//     const newState = !isEnabled;
//     setIsEnabled(newState);

//     if (newState) {
//       console.log("Registering reminder task");
//       // Using immediate frequency for testing
//       await registerFunction(
//         notificationDate.toISOString(),
//         as,
//         message,
//         "immediate"
//       );
//     } else {
//       console.log("Unregistering reminder task");
//       await BackgroundFetch.unregisterTaskAsync(taskName);
//     }
//   };

//   const sendTestNotification = async () => {
//     console.log("sendTestNotification called");
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: "Test Notification",
//         body: "This is a test notification",
//         data: { someData: "goes here" },
//       },
//       trigger: { seconds: 5 },
//     });
//   };

//   const frequencyOptions = [
//     { label: "Quotidien", value: "quotidien" },
//     { label: "Hebdomadaire", value: "hebdomadaire" },
//     { label: "Chaque deux jours", value: "chaquedeuxjours" },
//     { label: "Chaque trois jours", value: "chaquetroisjours" },
//   ];

//   const renderFrequencyItem = ({ item }) => {
//     const isSelected = item.value === selectedFrequency;
//     const itemStyle = isSelected
//       ? styles.selectedFrequency
//       : styles.regularFrequency;
//     return (
//       <TouchableOpacity onPress={() => setSelectedFrequency(item.value)}>
//         <Text style={[itemStyle, { color: isSelected ? "white" : "black" }]}>
//           {item.label}
//         </Text>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View>
//       <TouchableOpacity
//         onPress={() => setModalVisible(true)}
//         style={styles.container}
//         className="shadow-sm shadow-black"
//       >
//         <View style={styles.left}>
//           <Text style={styles.textRegular}>{as}</Text>
//           <Text style={styles.textRegular}>
//             Rappeler: {howmanytimeReminder}
//           </Text>
//         </View>
//         <View style={styles.right}>
//           <Switch
//             trackColor={{
//               false: theme === "pink" ? COLORS.neutral200 : COLORS.neutral250,
//               true: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
//             }}
//             thumbColor={isEnabled ? COLORS.neutral100 : COLORS.neutral100}
//             ios_backgroundColor={COLORS.neutral200}
//             onValueChange={toggleSwitch}
//             value={isEnabled}
//           />
//           <Button
//             title="Test Notification"
//             onPress={sendTestNotification}
//             color={COLORS.accent500}
//           />
//         </View>
//       </TouchableOpacity>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalView}>
//           <FlatList
//             data={frequencyOptions}
//             renderItem={renderFrequencyItem}
//             keyExtractor={(item) => item.value}
//           />
//           <Button
//             title="Close"
//             onPress={() => setModalVisible(false)}
//             color={COLORS.accent500}
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: SIZES.padding,
//     marginBottom: SIZES.margin,
//     borderRadius: SIZES.radius,
//     backgroundColor: COLORS.white,
//   },
//   left: {
//     flex: 1,
//   },
//   right: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   textRegular: {
//     fontSize: SIZES.font,
//     color: COLORS.black,
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 35,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   selectedFrequency: {
//     padding: 10,
//     marginVertical: 5,
//     backgroundColor: COLORS.accent600,
//     borderRadius: 10,
//   },
//   regularFrequency: {
//     padding: 10,
//     marginVertical: 5,
//     backgroundColor: COLORS.neutral200,
//     borderRadius: 10,
//   },
// });

// export default ReminderItem;

// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, Switch, StyleSheet, TouchableOpacity, Modal, Button, FlatList, Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';
// import * as TaskManager from 'expo-task-manager';
// import * as BackgroundFetch from 'expo-background-fetch';
// import Constants from 'expo-constants';
// import * as Device from 'expo-device';
// import { COLORS, SIZES } from '@/constants';
// import { useSelector } from '@legendapp/state/react';
// import { preferenceState } from '@/legendstate/AmpelaStates';

// const PILL_REMINDER_TASK = "PILL_REMINDER_TASK";
// const OVULATION_REMINDER_TASK = "OVULATION_REMINDER_TASK";
// const MENSTRUATION_REMINDER_TASK = "MENSTRUATION_REMINDER_TASK";

// // Set notification handler
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// // Task manager definitions
// TaskManager.defineTask(PILL_REMINDER_TASK, async ({ data, error }) => handleTaskExecution(data, error));
// TaskManager.defineTask(OVULATION_REMINDER_TASK, async ({ data, error }) => handleTaskExecution(data, error));
// TaskManager.defineTask(MENSTRUATION_REMINDER_TASK, async ({ data, error }) => handleTaskExecution(data, error));

// // Handle task execution
// const handleTaskExecution = async (data, error) => {
//   if (error) {
//     console.error(error);
//     return;
//   }
//   const { notificationDate, title, body, frequency } = data;
//   await scheduleNotification(notificationDate, title, body, frequency);
// };

// // Schedule notification
// const scheduleNotification = async (notificationDate, title, body, frequency) => {
//   const notificationTime = new Date(notificationDate);
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//       data: { someData: "goes here" },
//     },
//     trigger: { seconds: 5 }, // Immediate notification for testing
//   });

//   const nextNotificationTime = new Date(notificationTime);
//   switch (frequency) {
//     case "quotidien":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
//       break;
//     case "hebdomadaire":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
//       break;
//     case "chaquedeuxjours":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 2);
//       break;
//     case "chaquetroisjours":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 3);
//       break;
//     default:
//       break;
//   }

//   return BackgroundFetch.BackgroundFetchResult.NewData;
// };

// // Register tasks
// const registerTask = async (taskName, notificationDate, title, body, frequency) => {
//   const status = await BackgroundFetch.getStatusAsync();
//   if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
//     console.log("Background execution is restricted or denied.");
//     return;
//   }

//   const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
//   if (!isRegistered) {
//     return BackgroundFetch.registerTaskAsync(taskName, {
//       minimumInterval: 1 * 60,
//       stopOnTerminate: false,
//       startOnBoot: true,
//       data: { notificationDate, title, body, frequency },
//     });
//   } else {
//     return BackgroundFetch.unregisterTaskAsync(taskName);
//   }
// };

// // Register individual tasks
// const registerPillReminderTask = async (notificationDate, title, body, frequency) => {
//   return await registerTask(PILL_REMINDER_TASK, notificationDate, title, body, frequency);
// };
// const registerOvulationReminderTask = async (notificationDate, title, body, frequency) => {
//   return await registerTask(OVULATION_REMINDER_TASK, notificationDate, title, body, frequency);
// };
// const registerMenstruationReminderTask = async (notificationDate, title, body, frequency) => {
//   return await registerTask(MENSTRUATION_REMINDER_TASK, notificationDate, title, body, frequency);
// };

// // Notification registration and handling
// async function sendPushNotification(expoPushToken) {
//   const message = {
//     to: expoPushToken,
//     sound: 'default',
//     title: 'Original Title',
//     body: 'And here is the body!',
//     data: { someData: 'goes here' },
//   };

//   await fetch('https://exp.host/--/api/v2/push/send', {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Accept-encoding': 'gzip, deflate',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(message),
//   });
// }

// function handleRegistrationError(errorMessage) {
//   alert(errorMessage);
//   throw new Error(errorMessage);
// }

// async function registerForPushNotificationsAsync() {
//   if (Platform.OS === 'android') {
//     Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: '#FF231F7C',
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       handleRegistrationError('Permission not granted to get push token for push notification!');
//       return;
//     }
//     const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//     if (!projectId) {
//       handleRegistrationError('Project ID not found');
//     }
//     try {
//       const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
//       console.log(pushTokenString);
//       return pushTokenString;
//     } catch (e) {
//       handleRegistrationError(`${e}`);
//     }
//   } else {
//     handleRegistrationError('Must use physical device for push notifications');
//   }
// }

// // ReminderItem component
// const ReminderItem = ({ as, time, howmanytimeReminder }) => {
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const { theme } = useSelector(() => preferenceState.get());
//   const [selectedFrequency, setSelectedFrequency] = useState("quotidien");

//   const checkTaskStatus = async (taskName) => {
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
//     setIsEnabled(isRegistered);
//   };

//   useEffect(() => {
//     let taskName;
//     switch (as) {
//       case "Prise de pilule":
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }
//     checkTaskStatus(taskName);
//   }, [as]);

//   const toggleSwitch = async () => {
//     const notificationDate = new Date();
//     notificationDate.setHours(time.hour);
//     notificationDate.setMinutes(time.minutes);

//     let message;
//     let registerFunction;
//     let taskName;

//     switch (as) {
//       case "Prise de pilule":
//         message = "Vous devez prendre votre pilule";
//         registerFunction = registerPillReminderTask;
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         message = "Votre jour d'ovulation est le";
//         registerFunction = registerOvulationReminderTask;
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         message = `Il est temps pour ${as.toLowerCase()}`;
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }

//     const newState = !isEnabled;
//     setIsEnabled(newState);

//     if (newState) {
//       await registerFunction(notificationDate.toISOString(), as, message, selectedFrequency);
//     } else {
//       await BackgroundFetch.unregisterTaskAsync(taskName);
//     }
//   };

//   const sendTestNotification = async () => {
//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title: "Test Notification",
//         body: "This is a test notification",
//         data: { someData: "goes here" },
//       },
//       trigger: { seconds: 5 },
//     });
//   };

//   const frequencyOptions = [
//     { label: "Quotidien", value: "quotidien" },
//     { label: "Hebdomadaire", value: "hebdomadaire" },
//     { label: "Chaque deux jours", value: "chaquedeuxjours" },
//     { label: "Chaque trois jours", value: "chaquetroisjours" },
//   ];

//   const renderFrequencyItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.frequencyItem}
//       onPress={() => {
//         setSelectedFrequency(item.value);
//         setModalVisible(false);
//       }}
//     >
//       <Text style={styles.frequencyItemText}>{item.label}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={[styles.text, { color: theme === 'light' ? COLORS.primary : COLORS.white }]}>{as}</Text>
//       <View style={styles.switchContainer}>
//         <Switch
//           trackColor={{ false: COLORS.lightGray, true: COLORS.secondary }}
//           thumbColor={isEnabled ? COLORS.primary : COLORS.white}
//           ios_backgroundColor={COLORS.lightGray}
//           onValueChange={toggleSwitch}
//           value={isEnabled}
//         />
//       </View>
//       <TouchableOpacity
//         style={[styles.button, { backgroundColor: theme === 'light' ? COLORS.secondary : COLORS.primary }]}
//         onPress={() => setModalVisible(true)}
//       >
//         <Text style={styles.buttonText}>Changer la fréquence</Text>
//       </TouchableOpacity>
//       <Modal visible={modalVisible} transparent={true} animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <FlatList
//               data={frequencyOptions}
//               renderItem={renderFrequencyItem}
//               keyExtractor={(item) => item.value}
//             />
//             <Button title="Annuler" onPress={() => setModalVisible(false)} />
//           </View>
//         </View>
//       </Modal>
//       <TouchableOpacity style={styles.testButton} onPress={sendTestNotification}>
//         <Text style={styles.testButtonText}>Envoyer une notification de test</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: SIZES.padding,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.gray,
//   },
//   text: {
//     fontSize: SIZES.h3,
//     fontWeight: 'bold',
//   },
//   switchContainer: {
//     marginTop: SIZES.base,
//     marginBottom: SIZES.base,
//   },
//   button: {
//     padding: SIZES.padding,
//     borderRadius: SIZES.radius,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: SIZES.base,
//   },
//   buttonText: {
//     color: COLORS.white,
//     fontWeight: 'bold',
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalContent: {
//     width: '80%',
//     padding: SIZES.padding,
//     backgroundColor: COLORS.white,
//     borderRadius: SIZES.radius,
//   },
//   frequencyItem: {
//     padding: SIZES.padding,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.lightGray,
//   },
//   frequencyItemText: {
//     fontSize: SIZES.body3,
//   },
//   testButton: {
//     marginTop: SIZES.padding,
//     padding: SIZES.padding,
//     backgroundColor: COLORS.primary,
//     borderRadius: SIZES.radius,
//     alignItems: 'center',
//   },
//   testButtonText: {
//     color: COLORS.white,
//     fontWeight: 'bold',
//   },
// });

// export default ReminderItem;

// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Switch,
//   StyleSheet,
//   TouchableOpacity,
//   Modal,
//   Button,
//   FlatList,
//   Platform,
// } from "react-native";
// import * as Notifications from "expo-notifications";
// import * as TaskManager from "expo-task-manager";
// import * as BackgroundFetch from "expo-background-fetch";
// import Constants from "expo-constants";
// import * as Device from "expo-device";

// // Define task names
// const PILL_REMINDER_TASK = "PILL_REMINDER_TASK";
// const OVULATION_REMINDER_TASK = "OVULATION_REMINDER_TASK";
// const MENSTRUATION_REMINDER_TASK = "MENSTRUATION_REMINDER_TASK";

// // Set notification handler
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

// // Define task handlers
// TaskManager.defineTask(PILL_REMINDER_TASK, async () => handleTaskExecution(PILL_REMINDER_TASK));
// TaskManager.defineTask(OVULATION_REMINDER_TASK, async () => handleTaskExecution(OVULATION_REMINDER_TASK));
// TaskManager.defineTask(MENSTRUATION_REMINDER_TASK, async () => handleTaskExecution(MENSTRUATION_REMINDER_TASK));

// // Handle task execution
// const handleTaskExecution = async (taskName) => {
//   try {
//     // Get task-specific data from AsyncStorage or any persistent storage
//     const data = await getTaskData(taskName);
//     const { notificationDate, title, body, frequency } = data;
//     await scheduleNotification(notificationDate, title, body, frequency);
//   } catch (error) {
//     console.error(`Error executing ${taskName}:`, error);
//   }
// };

// // Retrieve task data (this should be adapted to your storage solution)
// const getTaskData = async (taskName) => {
//   // Mock data for demonstration purposes
//   const notificationDate = new Date();
//   notificationDate.setHours(notificationDate.getHours() + 1); // Mock future date
//   return {
//     notificationDate: notificationDate.toISOString(),
//     title: "Reminder",
//     body: `Time for your ${taskName}`,
//     frequency: "quotidien",
//   };
// };

// // Schedule notification
// const scheduleNotification = async (
//   notificationDate,
//   title,
//   body,
//   frequency
// ) => {
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//       data: { someData: "goes here" },
//     },
//     trigger: { seconds: 5 }, // Set a short delay for testing
//   });

//   const nextNotificationTime = new Date(notificationDate);
//   switch (frequency) {
//     case "quotidien":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 1);
//       break;
//     case "hebdomadaire":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 7);
//       break;
//     case "chaquedeuxjours":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 2);
//       break;
//     case "chaquetroisjours":
//       nextNotificationTime.setDate(nextNotificationTime.getDate() + 3);
//       break;
//     default:
//       break;
//   }

//   // Schedule next notification
//   await Notifications.scheduleNotificationAsync({
//     content: {
//       title,
//       body,
//       data: { someData: "goes here" },
//     },
//     trigger: { date: nextNotificationTime },
//   });
// };

// // Register tasks
// const registerTask = async (taskName, notificationDate, title, body, frequency) => {
//   const status = await BackgroundFetch.getStatusAsync();
//   if (
//     status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
//     status === BackgroundFetch.BackgroundFetchStatus.Denied
//   ) {
//     console.log("Background execution is restricted or denied.");
//     return;
//   }

//   await BackgroundFetch.registerTaskAsync(taskName, {
//     minimumInterval: 60, // Minimum interval in seconds
//     stopOnTerminate: false,
//     startOnBoot: true,
//     data: { notificationDate, title, body, frequency },
//   });
// };

// // Register individual tasks
// const registerPillReminderTask = async (notificationDate, title, body, frequency) => {
//   return await registerTask(PILL_REMINDER_TASK, notificationDate, title, body, frequency);
// };
// const registerOvulationReminderTask = async (notificationDate, title, body, frequency) => {
//   return await registerTask(OVULATION_REMINDER_TASK, notificationDate, title, body, frequency);
// };
// const registerMenstruationReminderTask = async (notificationDate, title, body, frequency) => {
//   return await registerTask(MENSTRUATION_REMINDER_TASK, notificationDate, title, body, frequency);
// };

// const handleRegistrationError = (errorMessage) => {
//   alert(errorMessage);
//   throw new Error(errorMessage);
// };

// const registerForPushNotificationsAsync = async () => {
//   if (Platform.OS === "android") {
//     await Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//     });
//   }

//   if (Device.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== "granted") {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== "granted") {
//       handleRegistrationError("Permission not granted to get push token for push notification!");
//       return;
//     }
//     const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
//     if (!projectId) {
//       handleRegistrationError("Project ID not found");
//     }
//     try {
//       const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
//       console.log(pushTokenString);
//       return pushTokenString;
//     } catch (e) {
//       handleRegistrationError(`${e}`);
//     }
//   } else {
//     handleRegistrationError("Must use physical device for push notifications");
//   }
// };

// // ReminderItem component
// const ReminderItem = ({ as, time, howmanytimeReminder }) => {
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedFrequency, setSelectedFrequency] = useState("quotidien");

//   useEffect(() => {
//     let taskName;
//     switch (as) {
//       case "Prise de pilule":
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }
//     checkTaskStatus(taskName);
//   }, [as]);

//   const checkTaskStatus = async (taskName) => {
//     const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
//     setIsEnabled(isRegistered);
//   };

//   const toggleSwitch = async () => {
//     const notificationDate = new Date();
//     notificationDate.setHours(time.hour);
//     notificationDate.setMinutes(time.minutes);

//     let registerFunction;
//     let taskName;

//     switch (as) {
//       case "Prise de pilule":
//         registerFunction = registerPillReminderTask;
//         taskName = PILL_REMINDER_TASK;
//         break;
//       case "Jour d'ovulation":
//         registerFunction = registerOvulationReminderTask;
//         taskName = OVULATION_REMINDER_TASK;
//         break;
//       case "Début des règles":
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//         break;
//       default:
//         registerFunction = registerMenstruationReminderTask;
//         taskName = MENSTRUATION_REMINDER_TASK;
//     }

//     const newState = !isEnabled;
//     setIsEnabled(newState);

//     if (newState) {
//       await registerFunction(notificationDate.toISOString(), as, `Reminder for ${as}`, selectedFrequency);
//     } else {
//       await BackgroundFetch.unregisterTaskAsync(taskName);
//     }
//   };

//   const frequencyOptions = [
//     { label: "Quotidien", value: "quotidien" },
//     { label: "Hebdomadaire", value: "hebdomadaire" },
//     { label: "Chaque deux jours", value: "chaquedeuxjours" },
//     { label: "Chaque trois jours", value: "chaquetroisjours" },
//   ];

//   const renderFrequencyItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.frequencyItem}
//       onPress={() => {
//         setSelectedFrequency(item.value);
//         setModalVisible(false);
//       }}
//     >
//       <Text style={styles.frequencyItemText}>{item.label}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <View>
//       <TouchableOpacity
//         onPress={() => setModalVisible(true)}
//         style={styles.container}
//       >
//         <View style={styles.left}>
//           <Text style={styles.textRegular}>{as}</Text>
//           <Text style={styles.textRegular}>
//             Rappeler: {howmanytimeReminder}
//           </Text>
//         </View>
//         <View style={styles.right}>
//           <Switch
//             trackColor={{
//               false: "#E0E0E0",
//               true: "#4CAF50",
//             }}
//             thumbColor={isEnabled ? "#FFF" : "#FFF"}
//             ios_backgroundColor="#E0E0E0"
//             onValueChange={toggleSwitch}
//             value={isEnabled}
//           />
//         </View>
//       </TouchableOpacity>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalView}>
//           <FlatList
//             data={frequencyOptions}
//             renderItem={renderFrequencyItem}
//             keyExtractor={(item) => item.value}
//           />
//           <Button
//             title="Close"
//             onPress={() => setModalVisible(false)}
//             color="#4CAF50"
//           />
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//     marginBottom: 8,
//     borderRadius: 8,
//     backgroundColor: "#FFF",
//   },
//   left: {
//     flex: 1,
//   },
//   frequencyItem: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E0E0E0",
//   },
//   frequencyItemText: {
//     fontSize: 16,
//   },
//   right: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   textRegular: {
//     fontSize: 16,
//     color: "#000",
//   },
//   modalView: {
//     margin: 20,
//     backgroundColor: "#FFF",
//     borderRadius: 20,
//     padding: 35,
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
// });

// export default ReminderItem;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Button,
  FlatList,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch from "expo-background-fetch";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { COLORS, SIZES } from "@/constants";
import { preferenceState } from "@/legendstate/AmpelaStates";
import { useSelector } from "@legendapp/state/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

// Define task names
const PILL_REMINDER_TASK = "PILL_REMINDER_TASK";
const OVULATION_REMINDER_TASK = "OVULATION_REMINDER_TASK";
const MENSTRUATION_REMINDER_TASK = "MENSTRUATION_REMINDER_TASK";

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Define task handlers
TaskManager.defineTask(PILL_REMINDER_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Error executing PILL_REMINDER_TASK:", error);
    return;
  }
  console.log("PILL_REMINDER_TASK executed");
  await handleTaskExecution(PILL_REMINDER_TASK);
});
TaskManager.defineTask(OVULATION_REMINDER_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Error executing OVULATION_REMINDER_TASK:", error);
    return;
  }
  console.log("OVULATION_REMINDER_TASK executed");
  await handleTaskExecution(OVULATION_REMINDER_TASK);
});
TaskManager.defineTask(MENSTRUATION_REMINDER_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Error executing MENSTRUATION_REMINDER_TASK:", error);
    return;
  }
  console.log("MENSTRUATION_REMINDER_TASK executed");
  await handleTaskExecution(MENSTRUATION_REMINDER_TASK);
});

// Handle task execution
const handleTaskExecution = async (taskName) => {
  try {
    const storedData = await AsyncStorage.getItem(taskName);
    if (storedData) {
      const { notificationDate, title, body, frequency } =
        JSON.parse(storedData);
      await scheduleNotification(notificationDate, title, body, frequency);
    }
  } catch (error) {
    console.error(`Error executing ${taskName}:`, error);
  }
};

// Schedule notification
const scheduleNotification = async (
  notificationDate,
  title,
  body,
  frequency
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { someData: "goes here" },
    },
    trigger: { date: new Date(notificationDate) },
  });

  if (frequency === "quotidien") {
    const nextNotificationTime = moment(notificationDate)
      .add(1, "day")
      .toDate();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { someData: "goes here" },
      },
      trigger: { date: nextNotificationTime },
    });
  }
  // Add other frequencies handling here
};

// Register tasks
const registerTask = async (
  taskName,
  notificationDate,
  title,
  body,
  frequency
) => {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.log("Background execution is restricted or denied.");
    return;
  }

  await AsyncStorage.setItem(
    taskName,
    JSON.stringify({ notificationDate, title, body, frequency })
  );

  await BackgroundFetch.registerTaskAsync(taskName, {
    minimumInterval: 60 * 15, // Minimum interval in seconds for testing
    stopOnTerminate: false,
    startOnBoot: true,
    data: { notificationDate, title, body, frequency },
  });
};

// Register individual tasks
const registerPillReminderTask = async (
  notificationDate,
  title,
  body,
  frequency
) => {
  return await registerTask(
    PILL_REMINDER_TASK,
    notificationDate,
    title,
    body,
    frequency
  );
};
const registerOvulationReminderTask = async (
  notificationDate,
  title,
  body,
  frequency
) => {
  return await registerTask(
    OVULATION_REMINDER_TASK,
    notificationDate,
    title,
    body,
    frequency
  );
};
const registerMenstruationReminderTask = async (
  notificationDate,
  title,
  body,
  frequency
) => {
  return await registerTask(
    MENSTRUATION_REMINDER_TASK,
    notificationDate,
    title,
    body,
    frequency
  );
};

const handleRegistrationError = (errorMessage) => {
  alert(errorMessage);
  throw new Error(errorMessage);
};

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
};

// ReminderItem component
const ReminderItem = ({ as, time, howmanytimeReminder }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState("quotidien");
  const { theme } = useSelector(() => preferenceState.get());

  useEffect(() => {
    let taskName;
    switch (as) {
      case "Prise de pilule":
        taskName = PILL_REMINDER_TASK;
        break;
      case "Jour d'ovulation":
        taskName = OVULATION_REMINDER_TASK;
        break;
      case "Début des règles":
        taskName = MENSTRUATION_REMINDER_TASK;
        break;
      default:
        taskName = MENSTRUATION_REMINDER_TASK;
    }
    checkTaskStatus(taskName);
    loadSelectedFrequency();
  }, [as]);

  const checkTaskStatus = async (taskName) => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(taskName);
    setIsEnabled(isRegistered);
  };

  const toggleSwitch = async () => {
    const notificationDate = new Date();
    notificationDate.setHours(time.hour);
    notificationDate.setMinutes(time.minutes);

    let registerFunction;
    let taskName;

    switch (as) {
      case "Prise de pilule":
        registerFunction = registerPillReminderTask;
        taskName = PILL_REMINDER_TASK;
        break;
      case "Jour d'ovulation":
        registerFunction = registerOvulationReminderTask;
        taskName = OVULATION_REMINDER_TASK;
        break;
      case "Début des règles":
        registerFunction = registerMenstruationReminderTask;
        taskName = MENSTRUATION_REMINDER_TASK;
        break;
      default:
        registerFunction = registerMenstruationReminderTask;
        taskName = MENSTRUATION_REMINDER_TASK;
    }

    const newState = !isEnabled;
    setIsEnabled(newState);

    if (newState) {
      await registerFunction(
        notificationDate.toISOString(),
        as,
        `Reminder for ${as}`,
        selectedFrequency
      );
    } else {
      await BackgroundFetch.unregisterTaskAsync(taskName);
    }
  };

  const loadSelectedFrequency = async () => {
    try {
      const storedFrequency = await AsyncStorage.getItem(`frequency_${as}`);
      if (storedFrequency) {
        setSelectedFrequency(storedFrequency);
      }
    } catch (error) {
      console.error("Failed to load selected frequency", error);
    }
  };

  const saveSelectedFrequency = async (frequency) => {
    try {
      await AsyncStorage.setItem(`frequency_${as}`, frequency);
    } catch (error) {
      console.error("Failed to save selected frequency", error);
    }
  };

  const frequencyOptions = [
    { label: "Quotidien", value: "quotidien" },
    { label: "Hebdomadaire", value: "hebdomadaire" },
    { label: "Chaque deux jours", value: "chaquedeuxjours" },
    { label: "Chaque trois jours", value: "chaquetroisjours" },
  ];

  const renderFrequencyItem = ({ item }) => {
    const isSelected = item.value === selectedFrequency;
    const styles = {
      regularFrequency: {
        backgroundColor: COLORS.neutral100,
        color: "black",
        padding: 10,
        borderRadius: 5,
      },
      selectedFrequency: {
        backgroundColor: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
        color: COLORS.white,
        padding: 10,
        borderRadius: 5,
      },
    };
    const itemStyle = isSelected
      ? styles.selectedFrequency
      : styles.regularFrequency;
    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedFrequency(item.value);
          saveSelectedFrequency(item.label);
        }}
      >
        <Text style={[itemStyle, { color: isSelected ? "white" : "black" }]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.container}
      >
        <View style={styles.left}>
          <Text style={styles.textRegular}>{as}</Text>
          <Text style={styles.textRegular}>
            Rappeler: {howmanytimeReminder}
          </Text>
        </View>
        <View style={styles.right}>
          <Switch
            trackColor={{
              false: theme === "pink" ? COLORS.neutral200 : COLORS.neutral250,
              true: theme === "pink" ? COLORS.accent600 : COLORS.accent800,
            }}
            thumbColor={isEnabled ? COLORS.neutral100 : COLORS.neutral100}
            ios_backgroundColor={COLORS.neutral200}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView} className="p-3 py-5">
            <Text className="text-[18px] text-center mb-10">{as}</Text>
            <Text className="mb-3">Périodicité</Text>
            <FlatList
              data={frequencyOptions}
              renderItem={renderFrequencyItem}
              keyExtractor={(item) => item.value}
              contentContainerStyle={{ marginBottom: 20 }}
            />
            <Button
              title="Terminer"
              onPress={() => setModalVisible(false)}
              color={theme === "pink" ? COLORS.accent600 : COLORS.accent800}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedFrequency: {
    backgroundColor: COLORS.accent600,
    color: COLORS.white,
    padding: 10,
    borderRadius: 5,
  },
  regularFrequency: {
    backgroundColor: COLORS.neutral100,
    color: "black",
    padding: 10,
    borderRadius: 5,
  },
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.neutral100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  left: {
    gap: 12,
    alignItems: "flex-start",
  },
  time: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginLeft: 20,
  },
  textRegular: {
    fontFamily: "Regular",
    fontSize: SIZES.medium,
  },
  textMedium: {
    fontFamily: "Medium",
    fontSize: SIZES.large,
  },

  frequencyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  frequencyItemText: {
    fontSize: 16,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  textRegular: {
    fontSize: 16,
    color: "#000",
  },
  modalContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    height: SIZES.height,
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    backgroundColor: "white",
    width: SIZES.width - 40,
    minHeight: SIZES.height * 0.3,
    borderRadius: 5,
  },
});

export default ReminderItem;
