// type AssertionOptions struct {
//     Challenge        []byte   `json:"challenge,omitempty"`
//     AllowCredentials []string `json:"allowCredentials,omitempty"`
//     RelyingPartyID   string   `json:"rpId,omitempty"`
// }

export interface AssertionOptions {
    challenge: ArrayBuffer;
    allowCredentials: string[];
    relyingPartyID: string;
}