import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";

const AdminScreen = () => {
    return (
        <View className="flex-1 items-center justify-center">
            <Text>Admin Screen</Text>
            <Link href={"/" as any} className="mt-4 p-4 rounded-md bg-blue-500 text-white">
                Go to Home
            </Link>
        </View>
    );
};

export default AdminScreen;