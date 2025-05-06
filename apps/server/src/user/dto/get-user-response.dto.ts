export class GetUserResponseDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  organizationId: string | null;
  organizationName: string | null;
}
