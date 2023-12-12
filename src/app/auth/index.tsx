import React, { createContext, useContext, useEffect, useState } from "react";
// import firebase from "firebase/compat/app";
import { useNavigate } from "react-router-dom";
import { globalState } from "../../state/store";
import { useHookstate } from "@hookstate/core";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CreateUser, GetUser } from "../../apollo/userQueries";
import firebase from "./firebaseConfig";
import Swal from "sweetalert2";
import { AssignGrantLevel } from "../../apollo/permissionsQueries";
import {
  BindOrganizationUser,
  ConfirmInvitee,
} from "../../apollo/helperQueries";
import { DecryptData, ROUTE_PATHS } from "../../constants";
import { CheckFreeTrialStatus } from "../../apollo/paymentQueries";
import { UserRolesEnum } from "../../constants/enums";
import {
  GetClientByFirebaseId,
  SetFirebaseId,
} from "../../apollo/clientQueries";
import { CLIENT_ROLE } from "../../constants";
import { getPermissionsDictionary } from "../routes/permissionsProvider";

// import { GetUserQuery } from "../../apollo/gql-types/graphql";
// import { graphql } from "../apollo/gql-types";

type User = firebase.User | null;

type ContextState = {
  user: User;
  authLoading: boolean;
  signInWithGoogle: Function;
  signUpWithEmailPassword: Function;
  signInWithEmailPassword: Function;
  sendPasswordResetEmail: Function;
  signOut: Function;
  reauthenticateWithCredential: Function;
  updatePassword: Function;
};

const FirebaseAuthContext = createContext<ContextState | null>(null);

function FirebaseAuthProvider({ children }) {
  const [getUser, getUserResponse] = useLazyQuery(GetUser);
  const [getClientByFirebaseId, getClientByFirebaseIdResponse] = useLazyQuery(
    GetClientByFirebaseId
  );
  const [confirmInvitee, confirmInviteeResponse] = useLazyQuery(ConfirmInvitee);
  const [createUser, createUserRespone] = useMutation(CreateUser);
  const [setFirebaseIdForClient, setFirebaseIdForClientResponse] =
    useMutation(SetFirebaseId);
  const [FreeTrialCheck, freeTrialCheckResponse] =
    useLazyQuery(CheckFreeTrialStatus);
  const [assignGrantLevel, assignGrantLevelResponse] =
    useMutation(AssignGrantLevel);
  const [bindUserOrganization, bindUserOrganizationRespone] =
    useMutation(BindOrganizationUser);

  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();
  const state = useHookstate(globalState);
  const user = state.user.get();
  const permissionsDictionary = getPermissionsDictionary();

  function setUser(firebaseUser: User) {
    if (firebaseUser) {
      // signOut();

      //redirected from employee sign up
      const invitedEmail = new URLSearchParams(window.location.search).get(
        "email"
      );
      const invitingOrg = new URLSearchParams(window.location.search).get(
        "orgId"
      );
      const invitingLocId = new URLSearchParams(window.location.search).get(
        "locId"
      );
      const isClient = new URLSearchParams(window.location.search).get(
        "client"
      );
      const clientEmail = new URLSearchParams(window.location.search).get(
        "clientEmail"
      );
      const decryptedOrgId = invitingOrg && DecryptData(invitingOrg);
      const decryptedLocId = invitingLocId && DecryptData(invitingLocId);
      const { metadata } = firebaseUser;
      const isNewUser = metadata.creationTime === metadata.lastSignInTime;
      state.user.set((prevState) => ({
        ...prevState,
        uid: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        displayName: firebaseUser.displayName || undefined,
        firstname: firebaseUser.displayName
          ? firebaseUser.displayName.split(" ")[0]
          : undefined,
        lastname: firebaseUser.displayName
          ? firebaseUser.displayName.split(" ")[1]
          : undefined,
        phoneNumber: firebaseUser.phoneNumber || undefined,
        photoURL: firebaseUser.photoURL || undefined,
      }));
      if (invitedEmail === null && invitingOrg === null) {
        if (isClient === "true") {
          setFirebaseIdForClient({
            variables: {
              updatedBy: firebaseUser.uid,
              clientEmail: clientEmail,
              firebaseId: firebaseUser.uid,
            },
            onCompleted: (response) => {
              if (response.clients.updateFirebaseId === true) {
                Swal.fire({
                  icon: "success",
                  titleText: "Sign Up Successfull",
                  text: "You have been signed up successfully",
                  confirmButtonText: "Continue to Sign In...",
                }).then(() => navigate(ROUTE_PATHS.SIGN_IN));
              } else if (response.clients.updateFirebaseId === false) {
                firebaseUser
                  .delete()
                  .then(() => {})
                  .catch((err) => {});
                Swal.fire({
                  icon: "error",
                  titleText: "Unable to create user",
                  text: "Please try again by following the link...",
                });
              } else throw new Error("UNABLE TO CREATE USER");
            },
          });
        } else if (!isNewUser) {
          getUser({
            variables: { id: firebaseUser.uid },
            onCompleted: (data) => {
              if (data.users.lookup !== null) {
                const isUserOnboarded = data.users.lookup.isOnboarded;
                const userRole = data.users.lookup.role;
                state.user.set((prevState) => ({
                  ...prevState,
                  firstname: data.users.lookup.firstname,
                  lastname: data.users.lookup.lastname,
                  isOnboarded: isUserOnboarded,
                  role: data.users.lookup.role,
                  organization: data.users.lookup.organization,
                  phoneNumber: data.users.lookup.phoneNumber,
                  address: data.users.lookup.address,
                  storeLocId: data.users.lookup.storeLocId,
                  favoriteScreenSetting:
                    data.users.lookup.favoriteScreenSetting,
                }));
                //check to see is the user has completed the onboarding flow
                if (!isUserOnboarded) {
                  Swal.fire({
                    icon: "info",
                    titleText: "Incomplete onboarding",
                    text: "User has not completed the onboarding, kindly finish it to proceed to the dashboard.",
                    confirmButtonText: "Continue onboarding...",
                  }).then(() => {
                    setAuthLoading(false);
                    userRole.name === UserRolesEnum.ADMIN
                      ? navigate(ROUTE_PATHS.ONBOARDING)
                      : navigate(ROUTE_PATHS.EMPLOYEE_ONBOARDING);
                  });
                } else {
                  if (state.user.get() !== undefined) {
                    FreeTrialCheck({
                      variables: {
                        userId: data.users.lookup.id,
                      },
                      onCompleted: (freeTrial) => {
                        if (
                          !freeTrial.payments.freeTrialStatus.availed ||
                          (freeTrial.payments.freeTrialStatus.active &&
                            freeTrial.payments.freeTrialStatus.remaining_time >
                              2)
                        ) {
                          setAuthLoading(false);
                          navigate(
                            `${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.DASHBOARD}`
                          );
                        } else {
                          if (freeTrial.payments.freeTrialStatus.active) {
                            setAuthLoading(false);
                            Swal.fire({
                              title: `You have only ${freeTrial.payments.freeTrialStatus.remaining_time} days remaining for your free trial, please subscribe a new plan`,
                              allowOutsideClick: false,
                              showDenyButton: true,
                              confirmButtonText: "Go to subscription plans",
                              denyButtonText: `Continue`,
                            }).then((result) => {
                              if (result.isConfirmed) {
                                navigate(ROUTE_PATHS.PAYMENT_PLANS, {
                                  state: {
                                    userId: data.users.lookup.id,
                                  },
                                });
                              } else if (result.isDenied) {
                                navigate(
                                  `${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.DASHBOARD}`
                                );
                              }
                            });
                          } else {
                            setAuthLoading(false);
                            Swal.fire({
                              title:
                                "Your free trial subscription is expired, please select a new plan",
                              allowOutsideClick: false,
                              confirmButtonText: "Go to subscription plans",
                            }).then((result) => {
                              /* Read more about isConfirmed, isDenied below */
                              if (result.isConfirmed) {
                                navigate(ROUTE_PATHS.PAYMENT_PLANS, {
                                  state: {
                                    userId: data.users.lookup.id,
                                  },
                                });
                              }
                            });
                          }
                        }
                      },
                    });
                  }
                }
              } else {
                getClientByFirebaseId({
                  variables: { firebaseId: firebaseUser.uid },
                  onCompleted(data) {
                    state.user.set((prev) => {
                      return {
                        ...prev,
                        fullname:
                          data.clients.lookupClientByFirebaseId.fullname,
                        firstname:
                          data.clients.lookupClientByFirebaseId.firstname,
                        lastname:
                          data.clients.lookupClientByFirebaseId.lastname,
                        role: {
                          ...CLIENT_ROLE,
                          permissions: [
                            permissionsDictionary?.client_view.view,
                            permissionsDictionary?.client_view_order.view,
                          ],
                        },
                      };
                    });
                    if (data.clients.lookupClientByFirebaseId !== null) {
                      setAuthLoading(false);
                      navigate(
                        `${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW}`,
                        {
                          state: {
                            id: data.clients.lookupClientByFirebaseId.id,
                            // order: order.id,
                          },
                        }
                      );
                    } else {
                      Swal.fire({
                        icon: "error",
                        titleText: "User not found!",
                        text: "User not registered, please sign up to continue!",
                      });
                    }
                  },
                  onError: (err) =>
                    console.log("COULD NOT GET USER FROM DB:::", err),
                });
              }
            },
            onError: (err) => console.log("COULD NOT GET USER FROM DB:::", err),
          });
        } else {
          const [firstname, lastname] = firebaseUser.displayName
            ? firebaseUser.displayName.split(" ")
            : ["", ""];

          getUser({
            variables: { id: firebaseUser.uid },
            onCompleted: (data) => {
              if (data.users.lookup !== null) {
                state.user.set((prevState) => ({
                  ...prevState,
                  firstname: data.users.lookup.firstname,
                  lastname: data.users.lookup.lastname,
                  isOnboarded: data.users.lookup.isOnboarded,
                  grantLevel: data.users.lookup.grantLevel,
                  role: data.users.lookup.role,
                  organization: data.users.lookup.organization,
                  storeLocId: data.users.lookup.storeLocId,
                  phoneNumber: data.users.lookup.phoneNumber,
                  address: data.users.lookup.address,
                }));
                if (data.users.lookup.isOnboarded === true) {
                  setAuthLoading(false);
                  navigate(`${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.DASHBOARD}`);
                } else {
                  if (data.users.lookup.role.name === UserRolesEnum.ADMIN) {
                    navigate(ROUTE_PATHS.ONBOARDING);
                  } else navigate(ROUTE_PATHS.EMPLOYEE_ONBOARDING);
                }
              } else {
                getClientByFirebaseId({
                  variables: { firebaseId: firebaseUser.uid },
                  onCompleted(data) {
                    if (data.clients.lookupClientByFirebaseId !== null) {
                      state.user.set((prev) => {
                        return {
                          ...prev,
                          fullname:
                            data.clients.lookupClientByFirebaseId.fullname,
                          firstname:
                            data.clients.lookupClientByFirebaseId.firstname,
                          lastname:
                            data.clients.lookupClientByFirebaseId.lastname,
                          role: {
                            ...CLIENT_ROLE,
                            permissions: [
                              permissionsDictionary?.client_view.view,
                              permissionsDictionary?.client_view_order.view,
                            ],
                          },
                        };
                      });
                      setAuthLoading(false);
                      navigate(
                        `${ROUTE_PATHS.LAYOUT}/${ROUTE_PATHS.CLIENT_VIEW}`,
                        {
                          state: {
                            id: data.clients.lookupClientByFirebaseId.id,
                            // order: order.id,
                          },
                        }
                      );
                    } else {
                      createUser({
                        variables: {
                          createdBy: firebaseUser.uid,
                          user: {
                            id: firebaseUser.uid,
                            firstname: firstname,
                            lastname: lastname,
                            email: firebaseUser.email,
                            isAdmin: true,
                          },
                        },
                        onCompleted: (response) => {
                          if (response.users.create === true) {
                            navigate(ROUTE_PATHS.ONBOARDING);
                          } else throw new Error("UNABLE TO CREATE USER");
                        },
                        onError: (err) => {},
                      });
                    }
                  },
                  onError: (err) =>
                    console.log("COULD NOT GET USER FROM DB:::", err),
                });
              }
            },
            onError: (err) => console.log("COULD NOT GET USER FROM DB:::", err),
          });
        }
      } else {
        confirmInvitee({
          variables: { email: invitedEmail },
          onCompleted: (resp) => {
            if (resp.users.confirmInvitee === true) {
              createUser({
                variables: {
                  createdBy: firebaseUser.uid,
                  user: {
                    id: firebaseUser.uid,
                    email: firebaseUser.email,
                    isAdmin: false,
                  },
                },
                onCompleted: (response) => {
                  if (response.users.create === true) {
                    //fire and forget the bind user to its organization mutation
                    bindUserOrganization({
                      variables: {
                        createdBy: firebaseUser.uid,
                        userOrganization: {
                          userId: firebaseUser.uid,
                          orgId: decryptedOrgId,
                        },
                      },
                      onCompleted: (resp) => {},
                      onError: (err) => {},
                    });
                    Swal.fire({
                      icon: "success",
                      titleText: "Sign Up Successfull",
                      text: "Finish the onboarding process to sign in",
                      confirmButtonText: "Continue to onboarding...",
                    }).then(() =>
                      navigate(ROUTE_PATHS.EMPLOYEE_ONBOARDING, {
                        state: decryptedLocId,
                      })
                    );
                  } else if (response.users.create === false) {
                    firebaseUser
                      .delete()
                      .then(() => {})
                      .catch((err) => {});
                    Swal.fire({
                      icon: "error",
                      titleText: "Unable to create user",
                      text: "Please try again by following the link...",
                    });
                  } else throw new Error("UNABLE TO CREATE EMPLOYEE");
                },
                onError: (err) => {},
              });
            } else {
              Swal.fire({
                icon: "error",
                titleText: "User Not Found",
                text: "This user was not invited by any organization. Kindly sign up using the invited email address.",
                confirmButtonText: "Continue",
              });
              //Delete the user from firebase
              firebaseUser
                .delete()
                .then(() => {})
                .catch((err) => {});
            }
          },
          onError: (err) => {},
        });
      }
    } else {
      state.user.set({});
      navigate(ROUTE_PATHS.SIGN_IN);
    }
  }

  ////////////////////////////////////////////////////////////////
  // listen to authentication changes
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return firebase
      .auth()
      .signInWithPopup(provider)
      .then(() => {
        // // Handle successful login with Google
      })
      .catch((error) => {
        // Handle Google login error
      });
  };

  const signUpWithEmailPassword = (email, password) => {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((resp) => {})
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          titleText: "Error during signup",
          text: error.message,
        });
      });
  };

  const signInWithEmailPassword = (email, password) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((resp) => {
        setAuthLoading(true);
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          titleText: "Incorrect username or password",
          text: error.message,
        });
      });
  };

  const sendPasswordResetEmail = (email) => {
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then((resp) => {
        // Password reset email sent!
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "User not found!",
          titleText: "Please add a valid email",
          text: error.message,
        });
        throw new Error(error);
      });
  };

  const reauthenticateWithCredential = (userCredentials) => {
    const credentials = firebase.auth.EmailAuthProvider.credential(
      userCredentials.email,
      userCredentials.password
    );
    const user = firebase.auth().currentUser;
    return user!
      .reauthenticateWithCredential(credentials)
      .then((resp) => {})
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error during authentication!",
          titleText: "Please add valid password",
          text: error.message,
        });
        throw new Error(error);
      });
  };

  const updatePassword = (password) => {
    const user = firebase.auth().currentUser;
    return user!
      .updatePassword(password)
      .then((resp) => {})
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error during Password Resetting!",
          titleText: "Please add a valid password and try again",
          text: error.message,
        });
        throw new Error(error);
      });
  };

  const signOut = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(null);
        localStorage.clear();
        // state.user.set({});
        navigate(ROUTE_PATHS.SIGN_IN, { replace: true });
      })
      .catch((error) => {
        // Handle sign out error
        setUser(null);
        // state.user.set({});
        navigate(ROUTE_PATHS.SIGN_IN, { replace: true });
      });
  };
  ////////////////////////////////////////////////////////////////

  // call this function when you want to authenticate the user
  const login = (user) => {
    setUser(user);
    navigate(ROUTE_PATHS.HOME);
  };

  const contextValue = {
    user,
    authLoading,
    signInWithGoogle,
    signUpWithEmailPassword,
    signInWithEmailPassword,
    sendPasswordResetEmail,
    signOut,
    reauthenticateWithCredential,
    updatePassword,
  };

  return (
    <FirebaseAuthContext.Provider value={contextValue}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

function useFirebaseAuth(): ContextState {
  const context = useContext(FirebaseAuthContext);
  if (context === null) {
    throw new Error(
      "useFirebaseAuth must be used within a FirebaseAuthProvider"
    );
  }
  return context;
}

export { FirebaseAuthProvider, FirebaseAuthContext, useFirebaseAuth };
