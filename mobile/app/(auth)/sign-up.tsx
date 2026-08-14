import { View, Text } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const Signup = () => {
    return (
        <View className="flex-1 items-center justify-center">
            <Text>signup</Text>
            <Link href="/(auth)/sign-in" className="mt-4 p-4 rounded-md bg-blue-500 text-white">
                Create Account
            </Link>
        </View>
    )
}

export default Signup