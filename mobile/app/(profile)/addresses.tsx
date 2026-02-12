import AddressCard from "@/components/AddressCard";
import Header from "@/components/Header";
import AddressFormModal from "@/components/AddressFormModal";
import { useAddresses } from "@/hooks/useAddressess";
import { useToast } from "@/context/ToastContext";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { AnimatedContainer } from "@/components/ui/AnimatedContainer";
import { router } from "expo-router";
import LoadingUI from "@/components/ui/Loading";
import ErrorUI from "@/components/ui/Error";
import EmptyUI from "@/components/ui/Empty";

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

  const { showToast } = useToast();

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
    Alert.alert("Delete Address", `Are you sure you want to delete ${label}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteAddress(addressId, {
          onSuccess: () => {
            showToast({ message: "Address deleted successfully", type: "success" });
          },
          onError: (error: any) => {
            showToast({ message: error?.response?.data?.message || "Failed to delete address", type: "error" });
          }
        })
      },
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
      showToast({ message: "Please fill in all fields", type: "error" });
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
            showToast({ message: "Address updated successfully", type: "success" });
          },
          onError: (error: any) => {
            showToast({
              message: error?.response?.data?.message || error?.response?.data?.error || "Failed to update address",
              type: "error"
            });
          },
        }
      );
    } else {
      // create new address
      addAddress(addressForm, {
        onSuccess: () => {
          setShowAddressForm(false);
          showToast({ message: "Address added successfully", type: "success" });
        },
        onError: (error: any) => {
          showToast({
            message: error?.response?.data?.message || error?.response?.data?.error || "Failed to add address",
            type: "error"
          });
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
          <EmptyUI title="No addresses yet" subtitle="Add your primary delivery address to speed up the checkout process." buttonTitle="Add Address" buttonAction={handleAddAddress} icon="location-outline" />
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
