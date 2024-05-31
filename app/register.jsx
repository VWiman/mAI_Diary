import { View, useWindowDimensions } from "react-native";
import { useTheme, Button, TextInput } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Register() {
	const theme = useTheme();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { width } = useWindowDimensions();
	const [isLoading, setIsLoading] = useState(false);

	const handleRegister = () => {
		setIsLoading(true);
		createUserWithEmailAndPassword(getAuth(), email, password)
			.then((user) => {
				setLoading(false);
				if (user) router.replace("/(tabs)");
			})
			.catch((err) => {
				alert(err?.message);
				setIsLoading(false);
			});
	};

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: theme.colors.background,
				paddingHorizontal: width / 10,
				gap: 12,
			}}>
			<View style={{ minWidth: "100%", gap: 6  }}>
				<TextInput
					autoCapitalize="none"
					label="Email"
					keyboardType="email-address"
					onChangeText={(text) => setEmail(text)}
					disabled={isLoading}
				/>
				<TextInput
					autoCapitalize="none"
					label="Password"
					secureTextEntry={true}
					onChangeText={(text) => setPassword(text)}
					disabled={isLoading}
				/>
			</View>

			<Button style={{width: 125}} mode="contained" onPress={handleRegister} disabled={isLoading}>
				Register
			</Button>
		</View>
	);
}
