export enum UserRolesEnum {
    ADMIN = 'ADMIN',
    USER = 'USER',
    CLIENT = 'CLIENT',
    ORIGINAL = 'ORIGINAL'

    // Add more roles if needed
};
export enum StageEnum {

    ORIGINAL = 'ORIGINAL',
    RESIZED = 'RESIZED',
    THUMBNAIL = 'THUMBNAIL',


};
export enum OrderStageEnum {
    OPEN = 'OPEN',
    DRAFT = 'DRAFT'

};
export enum PaymentTypeEnum {

    FULL = 'full'

};
export enum IntegrationServiceName {

    STRIPE = 'STRIPE',
    PAYPAL = 'PAYPAL',
    SQUARE = 'SQUARE',
    CALENDLY = 'CALENDLY',
    ACUITY = 'ACUITY'

};

export enum ClientRole {
    CLIENT = 'CLIENT',
    CLIENT_ROLE_ID = "1",
}