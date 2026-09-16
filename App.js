import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useForm, Controller } from "react-hook-form";
import { sendData } from "./services/sendData";

export default function App() {
  const today = new Date();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userName: "",
      email: "",
      checkInDate: today,
      checkOutDate: null,
      roomType: "standard",
    },
    mode: "onChange",
  });

  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");

  const [showPicker, setShowPicker] = React.useState(false);
  const [activeDate, setActiveDate] = React.useState(null);

  const openDatePicker = (dateType) => {
    setActiveDate(dateType);
    setShowPicker(true);
  };

  const handleDateChange = (event) => {
    if (!event) {
      return;
    }

    let selectedDate;

    // Support for the Jest tests
    if (event.nativeEvent?.timestamp) {
      selectedDate = new Date(event.nativeEvent.timestamp);
    }

    // Support for real DateTimePicker
    if (!selectedDate && event.type !== "dismissed") {
      return;
    }

    if (!selectedDate) {
      setShowPicker(false);
      return;
    }

    if (activeDate === "checkIn") {
      setValue("checkInDate", selectedDate);

      if (checkOutDate) {
        if (checkOutDate <= selectedDate) {
          setError("checkOutDate", {
            type: "validate",
            message:
              "The Check-Out Date must be later than the Check-In Date",
          });
        } else {
          clearErrors("checkOutDate");
        }
      }
    }

    if (activeDate === "checkOut") {
      setValue("checkOutDate", selectedDate);

      if (selectedDate <= checkInDate) {
        setError("checkOutDate", {
          type: "validate",
          message:
            "The Check-Out Date must be later than the Check-In Date",
        });
      } else {
        clearErrors("checkOutDate");
      }
    }

    setShowPicker(false);
    setActiveDate(null);
  };

  const onSubmit = (data) => {
    sendData({
      userName: data.userName,
      email: data.email,
      roomType: data.roomType,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
    });
  };

  return (
    <View style={styles.container}>
      <View>
        {/* HEADER */}
        <Text style={styles.formHeader}>Booking form</Text>

        {/* NAME */}
        <Text style={styles.formTitle}>Name</Text>

        <Controller
          control={control}
          name="userName"
          rules={{
            required: "Name is required",
            pattern: {
              value: /^[A-Z].{2,}$/,
              message:
                "Name must start with a capital letter and contain at least 3 characters",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="user-name-input"
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        {errors.userName && (
          <Text style={styles.errorText}>
            {errors.userName.message}
          </Text>
        )}

        {/* EMAIL */}
        <Text style={styles.formTitle}>e-mail</Text>

        <Controller
          control={control}
          name="email"
          rules={{
            required: "e-mail is required",
            pattern: {
              value:
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message:
                "Invalid email address. Please enter a valid email",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="email-input"
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        {errors.email && (
          <Text style={styles.errorText}>
            {errors.email.message}
          </Text>
        )}

        {/* CHECK-IN DATE */}
        <Text style={styles.formTitle}>Check-In Date</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openDatePicker("checkIn")}
        >
          <Text style={styles.dateButtonText}>
            {checkInDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {/* CHECK-OUT DATE */}
        <Text style={styles.formTitle}>Check-Out Date</Text>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => openDatePicker("checkOut")}
        >
          <Text style={styles.dateButtonText}>
            {checkOutDate
              ? checkOutDate.toLocaleDateString()
              : "Select Date"}
          </Text>
        </TouchableOpacity>

        {errors.checkOutDate && (
          <Text style={styles.errorText}>
            {errors.checkOutDate.message}
          </Text>
        )}

        {/* DATE PICKER */}
        {showPicker && (
          <DateTimePicker
            testID="date-time-picker"
            value={
              activeDate === "checkIn"
                ? checkInDate
                : checkOutDate || checkInDate
            }
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* ROOM TYPE */}
        <Text style={styles.formTitle}>
          Choose the room type:
        </Text>

        <View style={styles.pickerContainer}>
          <Controller
            control={control}
            name="roomType"
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={(selectedValue) => {
                  onChange(selectedValue.toLowerCase());
                }}
              >
                <Picker.Item
                  label="Standard"
                  value="standard"
                />
                <Picker.Item
                  label="Luxury"
                  value="luxury"
                />
                <Picker.Item
                  label="Family"
                  value="family"
                />
              </Picker>
            )}
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    width: "100%",
    maxWidth: 600,
  },

  button: {
    backgroundColor: "#0056b3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
    marginTop: 50,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
  },

  formHeader: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 20,
    marginTop: 20,
  },

  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    marginTop: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    borderRadius: 4,
  },

  dateButton: {
    backgroundColor: "#0056b3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    minHeight: 40,
    justifyContent: "center",
  },

  dateButtonText: {
    color: "white",
    fontSize: 14,
  },

  errorText: {
    color: "red",
    marginTop: 3,
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    overflow: "hidden",
  },
});