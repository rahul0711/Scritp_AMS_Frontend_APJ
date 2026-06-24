import React from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { C } from "./Theme";
import { OptionType } from "./types";

interface BottomSheetPickerProps {
  visible: boolean;
  label: string;
  options: OptionType[];
  selected: OptionType | null;
  onSelect: (val: OptionType) => void;
  onClose: () => void;
}

export const BottomSheetPicker = React.memo(({
  visible,
  label,
  options,
  selected,
  onSelect,
  onClose,
}: BottomSheetPickerProps) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <LinearGradient
          colors={[C.primary, C.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.sheetTitleBar}
        >
          <Text style={styles.sheetTitle}>Select {label}</Text>
        </LinearGradient>
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.sheetList}
          renderItem={({ item }) => {
            const active = selected?.id === item.id;
            return (
              <TouchableOpacity
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={[styles.sheetItem, active && styles.sheetItemActive]}
                activeOpacity={0.75}
              >
                <Text style={[styles.sheetItemText, active && styles.sheetItemTextActive]}>
                  {item.name}
                </Text>
                {active && <Check size={18} color={C.white} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 36,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 14,
    marginBottom: 0,
  },
  sheetTitleBar: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    marginTop: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
  },
  sheetList: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: C.bg,
  },
  sheetItemActive: {
    backgroundColor: C.primaryMid,
  },
  sheetItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  sheetItemTextActive: {
    color: C.white,
    fontWeight: "700",
  },
});
