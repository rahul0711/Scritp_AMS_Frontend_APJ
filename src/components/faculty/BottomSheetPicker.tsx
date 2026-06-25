import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Search, X } from "lucide-react-native";
import { C } from "./Theme";
import { OptionType } from "./types";

/** Fixed picker item height for getItemLayout */
const PICKER_ITEM_HEIGHT = 56;

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const keyExtractor = useCallback((item: OptionType) => String(item.id), []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: PICKER_ITEM_HEIGHT,
      offset: PICKER_ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const renderItem = useCallback(
    ({ item }: { item: OptionType }) => {
      const active = selected?.id === item.id;
      return (
        <TouchableOpacity
          onPress={() => {
            onSelect(item);
            setQuery("");
            onClose();
          }}
          style={[picker.item, active && picker.itemActive]}
          activeOpacity={0.72}
        >
          <Text style={[picker.itemText, active && picker.itemTextActive]} numberOfLines={2}>
            {item.name}
          </Text>
          {active && <Check size={18} color={C.white} />}
        </TouchableOpacity>
      );
    },
    [selected, onSelect, onClose]
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose} />
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title bar */}
        <LinearGradient
          colors={[C.primary, C.primaryMid]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.titleBar}
        >
          <Text style={styles.title}>Select {label}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={18} color={C.white} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Search bar */}
        {options.length > 4 && (
          <View style={styles.searchRow}>
            <Search size={16} color={C.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${label}...`}
              placeholderTextColor={C.textLight}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        )}

        {/* Options list */}
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No results for "{query}"</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
});

const picker = StyleSheet.create({
  item: {
    height: PICKER_ITEM_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  itemActive: {
    backgroundColor: C.primaryMid,
    borderColor: C.primaryMid,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.text,
    flex: 1,
    marginRight: 8,
  },
  itemTextActive: {
    color: C.white,
    fontWeight: "700",
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10,24,50,0.55)",
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "70%",
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 0,
  },
  titleBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: C.white,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    gap: 10,
    height: 46,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: C.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  empty: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 14,
  },
});
