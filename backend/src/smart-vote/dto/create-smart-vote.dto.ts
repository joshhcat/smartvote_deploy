export class CandidatesDto {
  student_id: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  position: string;
  party: string;
  about_yourself: string;
  purpose: string;
  election_type: string;
  status: string;
  remarks: string;
  image?: string; // Optional: URL or path to candidate profile image
}

export class VotersDto {
  student_id: string;
  firstname: string;
  lastname: string;
  department: string;
  course: string;
  year: string;
  email: string;
  password: string;
  facial_descriptor: string;
  gender?: string;
}
export class VotesDto {
  student_id: string;
  voters_id: string;
  fullname: string;
  email: string;
  department: string;
  election_type: string;
  president: string;
  vice_president: string;
  secretary: string;
  treasurer: string;
  auditor: string;
  mmo: string;
  representatives: string;
  voted_date: string;
}
export class AdminDto {
  admin_id: string;
  password: string;
  fullname: string;
  email: string;
  departments: string[];
  position: string;
  added_by: string;
  sendEmail?: boolean;
}

export class UpdatePasswordDto {
  admin_id: string;
  old_password: string;
  new_password: string;
}

export class CandidacyDto {
  candidacy_type: string;
  close_date: string;
  status: string;
  opened_by: string;
}

export class ElectionDto {
  election_type: string;
  close_date: string;
  status: string;
  opened_by: string;
}
