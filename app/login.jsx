import { View, useWindowDimensions } from "react-native";
import { useTheme, Button, TextInput } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Login() {
	const theme = useTheme();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { height, width } = useWindowDimensions();

	const handleLogin = () => {
		signInWithEmailAndPassword(getAuth(), email, password)
			.then((user) => {
				if (user) router.replace("/(tabs)");
			})
			.catch((err) => {
				alert(err?.message);
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
			<View style={{ minWidth: "100%" }}>
				<TextInput
					autoCapitalize="none"
					label="Email"
					keyboardType="email-address"
					onChangeText={(text) => setEmail(text)}
				/>
				<TextInput
					autoCapitalize="none"
					label={"Password"}
					secureTextEntry={true}
					onChangeText={(text) => setPassword(text)}
				/>
			</View>

			<Button mode="contained" onPress={handleLogin}>
				Log in
			</Button>
		</View>
	);
}
