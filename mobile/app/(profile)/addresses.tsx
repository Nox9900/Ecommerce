import AddressCard from "@/components/AddressCard";
import Header from "@/components/Header";
import AddressFormModal from "@/components/AddressFormModal";
import { useAddresses } from "@/hooks/useAddressess";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { router } from "expo-router";
import LoadingUI from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/Error";

function AddressesScreen() {
  const {
    addAddress,
    addresses,
    deleteAddress,
    isAddingAddress,
    isDeletingAddress,
    isError,
    isLoading,
    isUpdatingAddress,
    updateAddress,
  } = useAddresses();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    fullName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    isDefault: false,
  });

  const handleAddAddress = () => {
    setShowAddressForm(true);
    setEditingAddressId(null);
    setAddressForm({
      label: "",
      fullName: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: "",
      isDefault: false,
    });
  };

  const handleEditAddress = (address: Address) => {
    setShowAddressForm(true);
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    });
  };

  const handleDeleteAddress = (addressId: string, label: string) => {
    Alert.alert("Delete Address", `Are you sure you want to delete ${label}`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteAddress(addressId) },
    ]);
  };

  const handleSaveAddress = () => {
    if (
      !addressForm.label ||
      !addressForm.fullName ||
      !addressForm.streetAddress ||
      !addressForm.city ||
      !addressForm.state ||
      !addressForm.zipCode ||
      !addressForm.phoneNumber
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (editingAddressId) {
      // update an existing address
      updateAddress(
        {
          addressId: editingAddressId,
          addressData: addressForm,
        },
        {
          onSuccess: () => {
            setShowAddressForm(false);
            setEditingAddressId(null);
            Alert.alert("Success", "Address updated successfully");
          },
          onError: (error: any) => {
            Alert.alert("Error", error?.response?.data?.error || "Failed to update address");
          },
        }
      );
    } else {
      // create new address
      addAddress(addressForm, {
        onSuccess: () => {
          setShowAddressForm(false);
          Alert.alert("Success", "Address added successfully");
        },
        onError: (error: any) => {
          Alert.alert("Error", error?.response?.data?.error || "Failed to add address");
        },
      });
    }
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  if (isLoading) return <LoadingUI title="Loading" />;
  if (isError) return <ErrorUI title="Something went wrong" subtitle="We couldn't retrieve your saved items. Please try again." buttonTitle="Go Back" buttonAction={() => router.back()} />;


  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <Header onAdd={handleAddAddress} primaryText="My Addresses" />

      {/* ADDRESSES LIST */}
      {addresses.length === 0 ? (
        <AnimatedContainer animation="fadeUp" className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-surface-light rounded-full items-center justify-center mb-6">
            <Ionicons name="location-outline" size={48} color="#6366F1" />
          </View>
          <AppText className="text-text-primary font-bold text-2xl mt-4 text-center">No addresses yet</AppText>
          <AppText className="text-text-secondary text-center mt-2 mx-8 text-base">
            Add your primary delivery address to speed up the checkout process.
          </AppText>
          <TouchableOpacity
            className="bg-primary rounded-2xl px-10 py-4 mt-10 shadow-lg shadow-primary/20"
            activeOpacity={0.8}
            onPress={handleAddAddress}
          >
            <AppText className="text-white font-black uppercase tracking-tight">Add Address</AppText>
          </TouchableOpacity>
        </AnimatedContainer>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="px-6 py-6">
            {addresses.map((address, index) => (
              <AnimatedContainer animation="fadeUp" delay={index * 100} key={address._id}>
                <AddressCard
                  address={address}
                  onEdit={handleEditAddress}
                  onDelete={handleDeleteAddress}
                  isUpdatingAddress={isUpdatingAddress}
                  isDeletingAddress={isDeletingAddress}
                />
                <View className="h-[1px] bg-black/5 dark:bg-white/5 w-full mb-6" />
              </AnimatedContainer>
            ))}
          </View>
        </ScrollView>
      )}

      <AddressFormModal
        visible={showAddressForm}
        isEditing={!!editingAddressId}
        addressForm={addressForm}
        isAddingAddress={isAddingAddress}
        isUpdatingAddress={isUpdatingAddress}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        onFormChange={setAddressForm}
      />
    </View>
  );
}

export default AddressesScreen;
