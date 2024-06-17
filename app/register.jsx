import { Keyboard, View, useWindowDimensions } from "react-native";
import { useTheme, Button, TextInput } from "react-native-paper";
import { getAuth, createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth";
import { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { StateContext } from "../context/stateContext";
import { Spinner } from "../components/spinner";
import { createDiaryFile } from "../utilities/diaryManager";

export default function Register() {
	const theme = useTheme();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { width } = useWindowDimensions();
	const { isLoading, setIsLoading } = useContext(StateContext);

	const handleRegister = () => {
		setIsLoading(true);
		Keyboard.dismiss(true);
		createUserWithEmailAndPassword(getAuth(), email, password)
			.then(async (userCredential) => {
				const user = userCredential.user;
				try {
					await createDiaryFile(user.uid);
					console.log(`Registration successful for ${user.uid} and diary created and saved.`);
					signOut(getAuth());
					router.navigate("/landing"); 
				} catch (error) {
					console.error("Could not create diary file:", error);
					deleteUser(user)
						.then(() => {
							alert("Failed to create your diary. Please allow the app to access your files and try again.");
							console.log("User deleted successfully because the diary could not be created.");
						})
						.catch((delErr) => {
							console.error("Failed to delete the user after diary creation failed:", delErr);
						});
				}
				setIsLoading(false);
			})
			.catch((err) => {
				console.error("Registration failed:", err);
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

			<Button style={{ width: 125 }} mode="contained" onPress={handleRegister} disabled={isLoading}>
				{isLoading ? <Spinner theme={theme} /> : "Register"}
			</Button>
		</View>
	);
}
