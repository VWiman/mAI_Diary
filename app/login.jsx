import { View, useWindowDimensions, Keyboard } from "react-native";
import { useTheme, Button, TextInput } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Spinner } from "../components/spinner";
import { getDiaryEntries } from "../utilities/diaryManager";

export default function Login() {
	const theme = useTheme();
	const router = useRouter();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { width } = useWindowDimensions();

	const handleLogin = () => {
		setIsSubmitting(true);
		Keyboard.dismiss(true);
		signInWithEmailAndPassword(getAuth(), email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				try {
					await getDiaryEntries(user.uid);
					router.replace("/(tabs)");
				} catch (error) {
					signOut(getAuth());
					console.error("Error loading diary:", error);
					alert("Failed to access your diary. Please try again.");
				}
				setIsSubmitting(false);
			})
			.catch((err) => {
				alert(err?.message);
				setIsSubmitting(false);
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
			<View style={{ minWidth: "100%", gap: 6 }}>
				<TextInput
					autoCapitalize="none"
					label="Email"
					keyboardType="email-address"
					onChangeText={(text) => setEmail(text)}
					disabled={isSubmitting}
				/>
				<TextInput
					autoCapitalize="none"
					label="Password"
					secureTextEntry={true}
					onChangeText={(text) => setPassword(text)}
					disabled={isSubmitting}
				/>
			</View>

			<Button style={{ width: 125 }} mode="contained" onPress={handleLogin} disabled={isSubmitting}>
				{isSubmitting ? <Spinner theme={theme} /> : "Log in"}
			</Button>
		</View>
	);
}
