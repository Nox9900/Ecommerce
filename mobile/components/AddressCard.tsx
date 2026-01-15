import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "@/types";
import { useTheme } from "@/lib/useTheme";



interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string, label: string) => void;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
}



export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isUpdatingAddress,
  isDeletingAddress,
}: AddressCardProps) {

  return (
    <View className={`rounded-[32px] p-6 mb-4`}>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-12 h-12 items-center justify-center mr-4">
            <Ionicons name="location-outline" size={32} color="#6366F1" />
          </View>
          <View>
            <Text className="text-text-primary font-bold text-lg">{address.label}</Text>
            {address.isDefault && (
              <View className="bg-primary/20 self-start px-2 py-0.5 rounded-lg border border-primary/30 mt-1">
                <Text className="text-primary text-[10px] font-black uppercase tracking-tighter">Default</Text>
              </View>
            )}
          </View>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => onEdit(address)}
            className="w-10 h-10 rounded-full bg-surface-light items-center justify-center border border-white/10"
            disabled={isUpdatingAddress}
          >
            <Ionicons name="create-outline" size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(address._id, address.label)}
            className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center border border-red-500/20"
            disabled={isDeletingAddress}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="ml-16 space-y-1">
        <Text className="text-text-primary font-bold text-base">{address.fullName}</Text>
        <Text className="text-text-secondary text-sm leading-5 opacity-90">{address.streetAddress}</Text>
        <Text className="text-text-secondary text-sm leading-5 opacity-90">
          {address.city}, {address.state} {address.zipCode}
        </Text>
        <View className="flex-row items-center mt-2">
          <Ionicons name="call-outline" size={14} color="#64748B" style={{ marginRight: 6 }} />
          <Text className="text-text-tertiary text-xs font-medium">{address.phoneNumber}</Text>
        </View>
      </View>
    </View>

    
  );
}
