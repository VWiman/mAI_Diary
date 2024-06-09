// IMPORTANT: ChatGPT used to create comments

// Importing required modules and components
import { View, useWindowDimensions } from "react-native";
import { useTheme, Button, TextInput } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { StateContext } from "../context/stateContext";
import { Spinner } from "../components/spinner";
import { getDiaryEntries } from "../utilities/diaryManager";

export default function Login() {
	// Setup theme and routing
	const theme = useTheme();
	const router = useRouter();

	// State hooks for managing form inputs and loading state
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { width } = useWindowDimensions();
	const { isLoading, setIsLoading } = useContext(StateContext);

	// Handle user login
	const handleLogin = () => {
		setIsLoading(true); // Start loading
		signInWithEmailAndPassword(getAuth(), email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				try {
					// Attempt to access the diary entries to confirm file access
					const entries = await getDiaryEntries(user.uid);
					console.log(`Diary entries accessed successfully, total entries: ${entries.length}`);
					router.replace("/(tabs)"); // Navigate on success
				} catch (error) {
					// If diary access fails, sign out and notify the user
					signOut(getAuth()); // Correcting to use getAuth() to obtain the auth instance
					console.error("Error loading diary:", error);
					alert("Failed to access your diary. Please try again.");
				}
				setIsLoading(false); // End loading regardless of the outcome
			})
			.catch((err) => {
				// Handle login failure
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
			<View style={{ minWidth: "100%", gap: 6 }}>
				{/* Email input */}
				<TextInput
					autoCapitalize="none"
					label="Email"
					keyboardType="email-address"
					onChangeText={(text) => setEmail(text)}
					disabled={isLoading}
				/>
				{/* Password input */}
				<TextInput
					autoCapitalize="none"
					label="Password"
					secureTextEntry={true}
					onChangeText={(text) => setPassword(text)}
					disabled={isLoading}
				/>
			</View>

			{/* Login button */}
			<Button style={{ width: 125 }} mode="contained" onPress={handleLogin} disabled={isLoading}>
				{isLoading ? <Spinner theme={theme} /> : "Log in"}
			</Button>
		</View>
	);
}
