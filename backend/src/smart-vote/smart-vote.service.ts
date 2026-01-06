import {
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
} from '@nestjs/common';
import {
  AdminDto,
  CandidatesDto,
  VotersDto,
  VotesDto,
  CandidacyDto,
  ElectionDto,
  UpdatePasswordDto,
} from './dto/create-smart-vote.dto';
import { DatabaseService } from 'src/db/db.service';
import { PasswordHashService } from './password-hash.service';
import { MailerService } from './mailer.services';
import { FileUploadUtil } from 'src/utils/file-upload.util';
// import { UpdateSmartVoteDto } from './dto/update-smart-vote.dto';

@Injectable()
export class SmartVoteService {
  constructor(
    private readonly database: DatabaseService,
    private readonly passwordHashService: PasswordHashService,
    private readonly mailerService: MailerService,
  ) {}

  //ROUTES to be use in front end
  // get(key: string): string | undefined {
  //   return process.env[key];
  // }
  // getApiUrl(): object[] {
  //   return [
  //     { BASE_URL: process.env.BASE_URL ?? '' }, // Default to empty string if API_URL is undefined
  //     { NODE_MAILER_ROUTE: process.env.NODE_MAILER_ROUTE ?? '' }, // Default to empty string if FILE_PATH is undefined
  //     { FILE_PATH_ROUTE: process.env.FILE_PATH_ROUTE ?? '' }, // Default to empty string if FILE_PATH is undefined
  //     { WEBSITE_URL: process.env.WEBSITE_URL ?? '' }, // Default to empty string if FILE_PATH is undefined
  //   ];
  // }

  //*Insert Candidates with Student Existence Check
  async createCandidate(smartVoteCandidate: CandidatesDto) {
    try {
      // Check if student has already filed candidacy
      const [existingCandidates] = await this.database.query(
        'SELECT * FROM candidates WHERE student_id = ?',
        [smartVoteCandidate.student_id],
      );

      if (existingCandidates && existingCandidates.length > 0) {
        return {
          success: false,
          message: 'You have already filed candidacy. Each student can only file once.',
        };
      }

      // Ensure status is uppercase, default to 'PENDING' if not provided
      const status = (smartVoteCandidate.status || 'PENDING').toUpperCase();
      // Handle image field - convert to relative path for storage
      let image: string | null = null;
      if (smartVoteCandidate.image && typeof smartVoteCandidate.image === 'string' && smartVoteCandidate.image.trim() !== '') {
        const imageUrl = smartVoteCandidate.image.trim();
        // If it's a full URL, extract the relative path
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          try {
            // Extract path from URL (e.g., http://localhost:3004/uploads/candidates/file.jpg -> /uploads/candidates/file.jpg)
            const urlObj = new URL(imageUrl);
            image = urlObj.pathname;
          } catch (error) {
            // If URL parsing fails, try to extract path manually
            const pathMatch = imageUrl.match(/\/uploads\/.*$/);
            image = pathMatch ? pathMatch[0] : imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
          }
        } else if (imageUrl.startsWith('/')) {
          // Already a relative path
          image = imageUrl;
        } else {
          // Ensure it starts with /
          image = '/' + imageUrl;
        }
      }
      // Log the image value being saved for debugging
      console.log('Image value being saved to database:', image);

      // Get current date in MySQL DATE format (YYYY-MM-DD)
      const currentDate = new Date().toISOString().split('T')[0];

      const [insertResult] = await this.database.query(
        `INSERT INTO candidates (
          student_id, firstname, lastname, department, email, 
          position, election_type, party, about_yourself, purpose, 
          status, image, filed_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          smartVoteCandidate.student_id,
          smartVoteCandidate.firstname,
          smartVoteCandidate.lastname,
          smartVoteCandidate.department,
          smartVoteCandidate.email,
          smartVoteCandidate.position,
          smartVoteCandidate.election_type,
          smartVoteCandidate.party || '',
          smartVoteCandidate.about_yourself,
          smartVoteCandidate.purpose,
          status,
          image,
          currentDate,
        ],
      );

      return {
        success: true,
        message: 'Candidacy filed Successfully',
        data: insertResult,
      };
    } catch (error) {
      // Check if the error is related to duplicate student_id (backup check)
      console.log(error.message);

      if (
        error.message.includes('Duplicate entry') ||
        error.message.includes('PRIMARY') ||
        error.message.includes('student_id') ||
        error.message.includes('Student ID already exists')
      ) {
        return {
          success: false,
          message: 'You have already filed candidacy. Each student can only file once.',
        };
      }
      console.error('Error inserting candidate:', error);
      return {
        success: false,
        message: 'Error inserting candidate',
      };
    }
  }

  //* Getting all Candidates
  async findAllCandidates() {
    try {
      // Call the stored procedure to get all candidates
      const [result] =
        await this.database.callStoredProcedure('getAllCandidates');

      if (!result || result.length === 0) {
        throw new Error('No candidates found');
      }

      // Normalize image URLs
      const normalizedResult = (result || []).map((candidate: any) => {
        if (candidate.image && typeof candidate.image === 'string' && candidate.image.trim() !== '') {
          // If it's already a full URL, keep it
          if (candidate.image.startsWith('http://') || candidate.image.startsWith('https://')) {
            // Already normalized
          } else {
            // Ensure it starts with / if it's a relative path
            const imagePath = candidate.image.startsWith('/') ? candidate.image : `/${candidate.image}`;
            candidate.image = FileUploadUtil.getFileUrl(imagePath);
          }
        } else {
          // Set to null if empty or invalid
          candidate.image = null;
        }
        return candidate;
      });

      return {
        success: true,
        message: 'Candidates retrieved successfully',
        data: normalizedResult,
      };
    } catch (error) {
      console.error('Error retrieving candidates:', error);
      throw new Error('Failed to retrieve candidates. Please try again later.');
    }
  }

  //* Find Candidates by ID
  async findCandidatesByID(
    student_id: string,
    smartVoteCandidate: CandidatesDto,
  ) {
    try {
      // Assuming 'findCandidates' stored procedure takes a student_id
      const [result] = await this.database.callStoredProcedure(
        'findCandidates',
        [student_id],
      );

      // if (!result || result.length === 0) {
      //   throw new Error('No candidates found for the provided student ID.');
      // }

      // Normalize image URLs
      const normalizedResult = (result || []).map((candidate: any) => {
        if (candidate.image && typeof candidate.image === 'string' && candidate.image.trim() !== '') {
          // If it's already a full URL, keep it
          if (candidate.image.startsWith('http://') || candidate.image.startsWith('https://')) {
            // Already normalized
          } else {
            // Ensure it starts with / if it's a relative path
            const imagePath = candidate.image.startsWith('/') ? candidate.image : `/${candidate.image}`;
            candidate.image = FileUploadUtil.getFileUrl(imagePath);
          }
        } else {
          // Set to null if empty or invalid
          candidate.image = null;
        }
        return candidate;
      });

      return {
        success: true,
        message: 'Candidates retrieved successfully.',
        data: normalizedResult,
      };
    } catch (error) {
      // Log the error and throw a more descriptive, custom error
      console.error('Error retrieving candidates:', error);
      throw new Error('Failed to retrieve candidates. Please try again later.');
    }
  }

  //* Get Candidates by Election Type
  async getCandidates(election_type: string) {
    try {
      // Use direct SQL query instead of stored procedure
      const [result] = await this.database.query(
        'SELECT * FROM candidates WHERE election_type = ?',
        [election_type],
      );
      
      // Normalize image URLs
      const normalizedResult = (result || []).map((candidate: any) => {
        if (candidate.image && typeof candidate.image === 'string' && candidate.image.trim() !== '') {
          // If it's already a full URL, keep it
          if (candidate.image.startsWith('http://') || candidate.image.startsWith('https://')) {
            // Already normalized
          } else {
            // Ensure it starts with / if it's a relative path
            const imagePath = candidate.image.startsWith('/') ? candidate.image : `/${candidate.image}`;
            candidate.image = FileUploadUtil.getFileUrl(imagePath);
          }
        } else {
          // Set to null if empty or invalid
          candidate.image = null;
        }
        return candidate;
      });
      
      return {
        success: true,
        message: 'Candidates retrieved successfully.',
        data: normalizedResult,
      };
    } catch (error) {
      console.error('Error retrieving candidates:', error);
      throw new Error('Failed to retrieve candidates. Please try again later.');
    }
  }

  //* Get Approved Candidates
  async getApprovedCandidates(election_type: string) {
    try {
      // Use direct SQL query instead of stored procedure
      const [result] = await this.database.query(
        'SELECT * FROM candidates WHERE election_type = ? AND status = ?',
        [election_type, 'APPROVED'],
      );
      
      // Normalize image URLs
      const normalizedResult = (result || []).map((candidate: any) => {
        if (candidate.image && typeof candidate.image === 'string' && candidate.image.trim() !== '') {
          // If it's already a full URL, keep it
          if (candidate.image.startsWith('http://') || candidate.image.startsWith('https://')) {
            // Already normalized
          } else {
            // Ensure it starts with / if it's a relative path
            const imagePath = candidate.image.startsWith('/') ? candidate.image : `/${candidate.image}`;
            candidate.image = FileUploadUtil.getFileUrl(imagePath);
          }
        } else {
          // Set to null if empty or invalid
          candidate.image = null;
        }
        return candidate;
      });
      
      return {
        success: true,
        message: 'Candidates retrieved successfully.',
        data: normalizedResult,
      };
    } catch (error) {
      console.error('Error retrieving candidates:', error);
      throw new Error('Failed to retrieve candidates. Please try again later.');
    }
  }

  //* Update Candidate
  async updateCandidate(updateSmartVoteCandidate: CandidatesDto) {
    try {
      const result = await this.database.callStoredProcedure(
        'updateCandidate',
        [
          updateSmartVoteCandidate.student_id,
          updateSmartVoteCandidate.status,
          updateSmartVoteCandidate.remarks,
        ],
      );

      // Check if the result is null or undefined (no rows affected)
      if (result.affectedRows === 0) {
        return {
          success: false,
          message: 'Update candidate failed, no data found',
        };
      }

      return {
        success: true,
        message: 'Candidate updated successfully.',
        data: result, // You can return the result or just the ID depending on what your stored procedure returns
      };
    } catch (error) {
      // Log the error with more context for debugging
      console.error('Error updating candidate', error);
    }
  }

  //* Insert Voters
  async createVoter(smartVoteVoter: VotersDto) {
    try {
      const result = await this.database.callStoredProcedure('findStudent', [
        smartVoteVoter.student_id,
        smartVoteVoter.firstname,
      ]);

      if (result[0].length === 0) {
        return {
          success: false,
          message: 'Student not found in the database',
        };
      }

      // Hash the password using PasswordHashService
      const hashedPassword = await this.passwordHashService.hashPassword(
        smartVoteVoter.password,
      );

      try {
        const result = await this.database.callStoredProcedure('insertVoters', [
          smartVoteVoter.student_id,
          smartVoteVoter.firstname,
          smartVoteVoter.lastname,
          smartVoteVoter.department,
          smartVoteVoter.course,
          smartVoteVoter.year,
          smartVoteVoter.email,
          hashedPassword,
          smartVoteVoter.facial_descriptor,
          smartVoteVoter.gender || 'Other',
        ]);
        return {
          success: true,
          message: 'Voter Added Successfully',
          data: result,
        };
      } catch (error) {
        // Check if the err
        // or is related to the "Student ID already exists"
        // console.log(error.message);

        if (error.message.includes('Student ID already exists')) {
          return {
            success: false,
            message: 'This student ID already exists.',
          };
        }
        console.error('Error inserting candidate:', error);
        return {
          success: false,
          message: 'Error inserting candidate',
        };

        // throw new HttpException(
        //   'Failed to add voter. Please try again later.',
        //   HttpStatus.INTERNAL_SERVER_ERROR,
        // );
      }
    } catch (error) {
      console.error('Error finding student:', error);
      return {
        success: false,
        message: 'Error finding student',
      };
    }
  }

  //* Login function as voters
  async voterLogin(student_id: string, plainPassword: string) {
    try {
      // Get the stored password hash for the voter
      const result = await this.database.callStoredProcedure('votersLogin', [
        student_id,
      ]);

      if (result[0].length === 0) {
        return {
          success: false,
          message: 'Voter not found',
        };
      }

      // Assume `result[0][0].passwordHash` is the field where the hashed password is stored
      const storedPasswordHash = result[0][0].password;
      const responseData = result[0][0];
      // Compare the plain password with the stored hash
      const isPasswordValid = await this.passwordHashService.comparePasswords(
        plainPassword,
        storedPasswordHash,
      );

      console.log(result[0][0]);

      console.log(isPasswordValid);

      if (isPasswordValid) {
        return {
          success: true,
          message: 'Login successful',
          data: responseData,
        };
      } else {
        return {
          success: false,
          message: 'Invalid password',
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  }

  //* Login Admin

  async loginAdmin(smartVoteAdmin: AdminDto) {
    try {
      const [result] = await this.database.callStoredProcedure('adminLogin', [
        smartVoteAdmin.admin_id,
        smartVoteAdmin.password,
      ]);

      if (result.length === 1) {
        return {
          success: true,
          message: 'Successfully login',
          data: result,
        };
      } else {
        return {
          success: false,
          message: 'No data found',
        };
      }
    } catch (error) {
      console.error('Error during login:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  }

  //* Insert Admins
  async createAdmin(smartVoteAdmin: AdminDto) {
    try {
      const result = await this.database.callStoredProcedure('createAdmin', [
        smartVoteAdmin.admin_id,
        smartVoteAdmin.password,
        smartVoteAdmin.fullname,
        smartVoteAdmin.email,
        smartVoteAdmin.departments.join(','),
        smartVoteAdmin.position,
        smartVoteAdmin.added_by,
      ]);
      
      // Send email with credentials if sendEmail is true
      if (smartVoteAdmin.sendEmail && smartVoteAdmin.email) {
        try {
          await this.mailerService.sendEmail({
            to: smartVoteAdmin.email,
            subject: 'SmartVote Admin Account Created',
            text: `Hello ${smartVoteAdmin.fullname},\n\nYour admin account has been created.\n\nAdmin ID: ${smartVoteAdmin.admin_id}\nPassword: ${smartVoteAdmin.password}\n\nPlease login and change your password immediately.\n\nBest regards,\nSmartVote Team`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to SmartVote Admin</h2>
                <p>Hello <strong>${smartVoteAdmin.fullname}</strong>,</p>
                <p>Your admin account has been created successfully.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Admin ID:</strong> ${smartVoteAdmin.admin_id}</p>
                  <p style="margin: 5px 0;"><strong>Password:</strong> ${smartVoteAdmin.password}</p>
                </div>
                <p style="color: #e74c3c;"><strong>Important:</strong> Please login and change your password immediately for security purposes.</p>
                <p>Best regards,<br/>SmartVote Team</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Don't fail the whole operation if email fails
        }
      }
      
      return {
        success: true,
        message: smartVoteAdmin.sendEmail 
          ? 'Admin added successfully. Credentials sent to email.' 
          : 'Admin added successfully.',
      };
    } catch (error) {
      // Optionally log the error to a logging service

      if (error.message.includes('Admin ID already exists')) {
        return {
          success: false,
          message: 'This Admin ID already exists.',
        };
      }
      console.error('Error inserting admin:', error);
      return {
        success: false,
        message: 'Error inserting admin',
      };
    }
  }

  //* Getting all Admins
  async getAllAdmins() {
    try {
      // Call the stored procedure to get all candidates
      const [result] = await this.database.callStoredProcedure('getAdmins');

      // if (!result || result.length === 0) {
      //   throw new Error('No candidates found');
      // }

      return {
        success: true,
        message: 'Candidates retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error retrieving candidates:', error);
      throw new Error('Failed to retrieve candidates. Please try again later.');
    }
  }

  //* Update Admin by Admin ID
  async updateAdminByID(updateAdminByID: AdminDto) {
    try {
      // Assuming 'findCandidates' stored procedure takes a student_id
      const result = await this.database.callStoredProcedure('updateAdmin', [
        updateAdminByID.admin_id,
        updateAdminByID.fullname,
        updateAdminByID.email,
        updateAdminByID.position,
        updateAdminByID.departments.join(','),
      ]);
      return {
        success: true,
        message: 'Admin updated successfully.',
        data: result,
      };
    } catch (error) {
      // Log the error and throw a more descriptive, custom error
      console.error('Error updating admin:', error);
      throw new Error('Failed to updated admin. Please try again later.');
    }
  }

  //* Delete Admin by Admin ID
  async deleteAdminByID(admin_id: string) {
    try {
      // Assuming 'findCandidates' stored procedure takes a student_id
      const result = await this.database.callStoredProcedure('deleteAdmin', [
        admin_id,
      ]);

      // if (!result || result.length === 0) {
      //   throw new Error('No candidates found for the provided student ID.');
      // }

      return {
        success: true,
        message: 'Admin deleted successfully.',
        data: result,
      };
    } catch (error) {
      // Log the error and throw a more descriptive, custom error
      console.error('Error deleting admin:', error);
      throw new Error('Failed to delete admin. Please try again later.');
    }
  }

  //* Update Admin Password
  async updateAdminPassword(updatePasswordDto: UpdatePasswordDto) {
    try {
      // First verify the old password
      const [verifyResult] = await this.database.callStoredProcedure('adminLogin', [
        updatePasswordDto.admin_id,
        updatePasswordDto.old_password,
      ]);

      if (verifyResult.length === 0) {
        return {
          success: false,
          message: 'Current password is incorrect.',
        };
      }

      // Update the password and set is_first_login to false
      const result = await this.database.callStoredProcedure('updateAdminPassword', [
        updatePasswordDto.admin_id,
        updatePasswordDto.new_password,
      ]);

      return {
        success: true,
        message: 'Password updated successfully.',
        data: result,
      };
    } catch (error) {
      console.error('Error updating admin password:', error);
      return {
        success: false,
        message: 'Failed to update password. Please try again.',
      };
    }
  }

  //*Get Candidacy Schedule
  async getCandidacySchedule(candidacy_type: string) {
    try {
      const [result] = await this.database.callStoredProcedure(
        'getCandidacySchedule',
        [candidacy_type],
      );
      return {
        success: true,
        message: 'Candidacy Schedule Retrieved',
        data: result,
      };
    } catch (error) {
      // Log the error and throw a more descriptive, custom error
      console.error(error);
      throw new Error('Error Retrieving Candidacy Schedule');
    }
  }
  //* Update Candidacy Schedule
  async updateCandidacy(updateSmartVoteDto: CandidacyDto) {
    try {
      // First check if record exists
      const [existingRecord] = await this.database.callStoredProcedure(
        'getCandidacySchedule',
        [updateSmartVoteDto.candidacy_type],
      );

      if (!existingRecord || existingRecord.length === 0) {
        // INSERT new record if doesn't exist
        await this.database.query(
          `INSERT INTO candidacy (candidacy_type, open_date, close_date, status, opened_by) 
           VALUES (?, NOW(), ?, ?, ?)`,
          [
            updateSmartVoteDto.candidacy_type,
            updateSmartVoteDto.close_date,
            updateSmartVoteDto.status,
            updateSmartVoteDto.opened_by,
          ],
        );
      } else {
        // UPDATE existing record
        await this.database.query(
          `UPDATE candidacy 
           SET open_date = NOW(), close_date = ?, status = ?, opened_by = ? 
           WHERE candidacy_type = ?`,
          [
            updateSmartVoteDto.close_date,
            updateSmartVoteDto.status,
            updateSmartVoteDto.opened_by,
            updateSmartVoteDto.candidacy_type,
          ],
        );
      }

      return {
        success: true,
        message: 'Candidacy schedule updated successfully.',
      };
    } catch (error) {
      // Log the error with more context for debugging
      console.error('Error updating candidacy schedule:', error);
      return {
        success: false,
        message: 'Failed to update candidacy schedule',
      };
    }
  }

  //*Get Election Schedule
  async getElectionSchedule(election_type: string) {
    try {
      const [result] = await this.database.callStoredProcedure(
        'getElectionSchedule',
        [election_type],
      );

      return {
        success: true,
        message: 'Election Schedule Retrieve',
        data: result,
      };
    } catch (error) {
      console.error('Error retrieving election schedule:', error);
      throw new HttpException(
        'Failed to update election schedule',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  //*Update Election Schedule
  async updateElectionSchedule(updateSmartVoteDto: ElectionDto) {
    try {
      const result = await this.database.callStoredProcedure('updateElection', [
        updateSmartVoteDto.election_type,
        updateSmartVoteDto.close_date,
        updateSmartVoteDto.status,
        updateSmartVoteDto.opened_by,
      ]);

      return {
        success: true,
        message: 'Election schedule updated successfully.',
        data: result,
      };
    } catch (error) {
      console.error('Error updating election schedule:', error);
      return {
        success: false,
        message: 'Failed to update election schedule',
      };
    }
  }

  //?Votes
  //* Insert Votes
  async createVotes(smartVoteVotes: VotesDto) {
    try {
      const result = await this.database.callStoredProcedure('insertVotes', [
        smartVoteVotes.student_id,
        smartVoteVotes.voters_id,
        smartVoteVotes.fullname,
        smartVoteVotes.email,
        smartVoteVotes.department,
        smartVoteVotes.election_type,
        smartVoteVotes.president,
        smartVoteVotes.vice_president,
        smartVoteVotes.secretary,
        smartVoteVotes.treasurer || '',
        smartVoteVotes.auditor || '',
        smartVoteVotes.mmo || '',
        smartVoteVotes.representatives || '',
      ]);

      return {
        success: true,
        message:
          "Awesome! You've already voted. Thanks for taking part in the process!",
        data: result,
      };
    } catch (error) {
      if (error.message.includes('Student Already Voted')) {
        return {
          success: false,
          message: "Looks like you've already cast your vote!",
        };
      }
      console.error('Error inserting vote:', error);
      return {
        success: false,
        message: 'Error inserting vote',
      };
    }
  }

  //? Get Vote History
  async getVoteHistory(smartVoteVotes: VotesDto) {
    try {
      const [result] = await this.database.callStoredProcedure(
        'getVoteHistory',
        [smartVoteVotes.student_id, smartVoteVotes.voters_id],
      );

      return {
        success: true,
        message: 'Votes retrieve successful',
        data: result,
      };
    } catch (error) {
      console.error('Error retrieving vote history:', error);
      throw new Error(
        'Failed to retrieve vote history. Please try again later.',
      );
    }
  }

  //? Get Voters by Department for email notifications
  async getVotersByDepartment(election_type: string) {
    try {
      const [result] = await this.database.callStoredProcedure(
        'getVotersByDepartment',
        [election_type],
      );

      return {
        success: true,
        message: 'Voters retrieved successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error retrieving voters by department:', error);
      throw new Error(
        'Failed to retrieve voters. Please try again later.',
      );
    }
  }

  //? Get Election Results - count votes per candidate per position
  async getElectionResults(election_type: string) {
    try {
      const [result] = await this.database.callStoredProcedure(
        'getElectionResults',
        [election_type],
      );

      // Process results to group by position and sort by votes
      const votes = result || [];
      const totalVoters = votes.length;

      // Count votes for each position
      const presidentCounts: Record<string, number> = {};
      const vicePresidentCounts: Record<string, number> = {};
      const secretaryCounts: Record<string, number> = {};
      const treasurerCounts: Record<string, number> = {};
      const auditorCounts: Record<string, number> = {};
      const mmoCounts: Record<string, number> = {};
      const representativesCounts: Record<string, number> = {};

      votes.forEach((vote: any) => {
        // Count president votes
        if (vote.president) {
          presidentCounts[vote.president] = (presidentCounts[vote.president] || 0) + 1;
        }
        // Count vice president votes
        if (vote.vice_president) {
          vicePresidentCounts[vote.vice_president] = (vicePresidentCounts[vote.vice_president] || 0) + 1;
        }
        // Count secretary votes
        if (vote.secretary) {
          secretaryCounts[vote.secretary] = (secretaryCounts[vote.secretary] || 0) + 1;
        }
        // Count treasurer votes
        if (vote.treasurer) {
          treasurerCounts[vote.treasurer] = (treasurerCounts[vote.treasurer] || 0) + 1;
        }
        // Count auditor votes
        if (vote.auditor) {
          auditorCounts[vote.auditor] = (auditorCounts[vote.auditor] || 0) + 1;
        }
        // Count mmo votes
        if (vote.mmo) {
          mmoCounts[vote.mmo] = (mmoCounts[vote.mmo] || 0) + 1;
        }
        // Count representatives votes
        if (vote.representatives) {
          representativesCounts[vote.representatives] = (representativesCounts[vote.representatives] || 0) + 1;
        }
      });

      // Convert to sorted arrays
      const sortByVotes = (counts: Record<string, number>) => {
        return Object.entries(counts)
          .map(([name, voteCount]) => ({ name, votes: voteCount }))
          .sort((a, b) => b.votes - a.votes);
      };

      return {
        success: true,
        message: 'Election results retrieved successfully',
        data: {
          totalVoters,
          results: {
            president: sortByVotes(presidentCounts),
            vice_president: sortByVotes(vicePresidentCounts),
            secretary: sortByVotes(secretaryCounts),
            treasurer: sortByVotes(treasurerCounts),
            auditor: sortByVotes(auditorCounts),
            mmo: sortByVotes(mmoCounts),
            representatives: sortByVotes(representativesCounts),
          },
        },
      };
    } catch (error) {
      console.error('Error retrieving election results:', error);
      return {
        success: false,
        message: 'Failed to retrieve election results',
        data: { totalVoters: 0, results: {} },
      };
    }
  }

  //? Get Election Statistics - votes by department (for SSG) or year level (for department elections)
  //? Also includes gender breakdown
  async getElectionStatistics(election_type: string) {
    try {
      // Get votes with voter information including gender and year_level
      const [votesWithGender] = await this.database.query(
        `SELECT v.*, vr.gender, vr.year_level 
         FROM votes v 
         LEFT JOIN voters vr ON v.student_id = vr.student_id 
         WHERE v.election_type = ? AND YEAR(v.voted_date) = YEAR(NOW())`,
        [election_type],
      );

      const votes = votesWithGender || [];
      const totalVotes = votes.length;

      // Count gender for all elections
      const genderCounts = { Male: 0, Female: 0, Other: 0 };
      votes.forEach((vote: any) => {
        const gender = vote.gender || 'Other';
        if (gender === 'Male') genderCounts['Male']++;
        else if (gender === 'Female') genderCounts['Female']++;
        else genderCounts['Other']++;
      });

      if (election_type === 'SSG') {
        // For SSG elections, count votes by department with gender breakdown
        const departmentCounts: Record<string, number> = {};
        const departmentGender: Record<string, { Male: number; Female: number; Other: number }> = {};

        votes.forEach((vote: any) => {
          const dept = vote.department || 'Unknown';
          departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

          // Gender breakdown per department
          if (!departmentGender[dept]) {
            departmentGender[dept] = { Male: 0, Female: 0, Other: 0 };
          }
          const gender = vote.gender || 'Other';
          if (gender === 'Male') departmentGender[dept]['Male']++;
          else if (gender === 'Female') departmentGender[dept]['Female']++;
          else departmentGender[dept]['Other']++;
        });

        return {
          success: true,
          message: 'Election statistics retrieved successfully',
          data: {
            totalVotes,
            byDepartment: departmentCounts,
            byGender: genderCounts,
            departmentGender: departmentGender,
          },
        };
      } else {
        // For department elections, count votes by year level with gender breakdown
        const yearLevelCounts = { '1st Year': 0, '2nd Year': 0, '3rd Year': 0, '4th Year': 0, '5th Year+': 0 };
        const yearLevelGender = {
          '1st Year': { Male: 0, Female: 0, Other: 0 },
          '2nd Year': { Male: 0, Female: 0, Other: 0 },
          '3rd Year': { Male: 0, Female: 0, Other: 0 },
          '4th Year': { Male: 0, Female: 0, Other: 0 },
          '5th Year+': { Male: 0, Female: 0, Other: 0 },
        };
        const currentYear = new Date().getFullYear();

        votes.forEach((vote: any) => {
          // Use year_level from voters table if available, otherwise calculate from student_id
          let yearLevel = vote.year_level;
          
          if (!yearLevel && vote.student_id) {
            const enrollmentYear = parseInt(vote.student_id.substring(0, 4));
            const yearsInSchool = currentYear - enrollmentYear + 1;
            
            if (yearsInSchool === 1) yearLevel = '1st Year';
            else if (yearsInSchool === 2) yearLevel = '2nd Year';
            else if (yearsInSchool === 3) yearLevel = '3rd Year';
            else if (yearsInSchool === 4) yearLevel = '4th Year';
            else yearLevel = '5th Year+';
          }

          if (yearLevel && yearLevelCounts[yearLevel] !== undefined) {
            yearLevelCounts[yearLevel]++;
            
            const gender = vote.gender || 'Other';
            if (gender === 'Male') yearLevelGender[yearLevel]['Male']++;
            else if (gender === 'Female') yearLevelGender[yearLevel]['Female']++;
            else yearLevelGender[yearLevel]['Other']++;
          }
        });

        return {
          success: true,
          message: 'Election statistics retrieved successfully',
          data: {
            totalVotes,
            byYearLevel: yearLevelCounts,
            byGender: genderCounts,
            yearLevelGender: yearLevelGender,
          },
        };
      }
    } catch (error) {
      console.error('Error retrieving election statistics:', error);
      return {
        success: false,
        message: 'Failed to retrieve election statistics',
        data: { totalVotes: 0 },
      };
    }
  }

  //? Get Dashboard Stats - students, voters, admins counts
  async getDashboardStats(department?: string) {
    try {
      let studentsCount = 0;
      let votersCount = 0;
      let adminsCount = 0;
      let votersByDepartment: any[] = [];

      // Get students count from student table
      try {
        const [studentsResult] = await this.database.query('SELECT COUNT(*) as count FROM student');
        studentsCount = studentsResult[0]?.count || 0;
      } catch (e) {
        console.log('Students table not found');
      }

      // Get registered voters count from voters table
      if (department) {
        const [votersResult] = await this.database.query(
          `SELECT COUNT(*) as count FROM voters WHERE department = '${department}'`
        );
        votersCount = votersResult[0]?.count || 0;
      } else {
        const [votersResult] = await this.database.query('SELECT COUNT(*) as count FROM voters');
        votersCount = votersResult[0]?.count || 0;
      }

      // Get admins count
      if (department) {
        const [adminsResult] = await this.database.query(
          `SELECT COUNT(*) as count FROM admins WHERE departments LIKE '%${department}%'`
        );
        adminsCount = adminsResult[0]?.count || 0;
      } else {
        const [adminsResult] = await this.database.query('SELECT COUNT(*) as count FROM admins');
        adminsCount = adminsResult[0]?.count || 0;
      }

      // Get voters by department for charts
      const [votersByDeptResult] = await this.database.query(
        'SELECT department, COUNT(*) as count FROM voters GROUP BY department'
      );
      votersByDepartment = votersByDeptResult || [];

      return {
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: {
          studentsCount,
          votersCount,
          adminsCount,
          votersByDepartment,
        },
      };
    } catch (error) {
      console.error('Error retrieving dashboard stats:', error);
      return {
        success: false,
        message: 'Failed to retrieve dashboard stats',
        data: {
          studentsCount: 0,
          votersCount: 0,
          adminsCount: 0,
          votersByDepartment: [],
        },
      };
    }
  }

  // Get voting history - voters who have voted and who haven't
  async getVotingHistory(election_type: string) {
    try {
      // Get all registered voters
      let votersQuery = 'SELECT voters_id, student_id, firstname, lastname, department, course, year_level, email FROM voters';
      const queryParams: string[] = [];
      
      // If not SSG, filter by department
      if (election_type !== 'SSG') {
        votersQuery += ' WHERE department = ?';
        queryParams.push(election_type);
      }
      
      const [allVoters] = await this.database.query(votersQuery, queryParams);
      
      // Get voters who have voted in this election (current year)
      const [votedResult] = await this.database.query(
        `SELECT DISTINCT student_id FROM votes WHERE election_type = ? AND YEAR(voted_date) = YEAR(NOW())`,
        [election_type]
      );
      
      const votedStudentIds = new Set(votedResult.map((v: any) => v.student_id));
      
      // Separate voters into voted and not voted
      const voted: any[] = [];
      const notVoted: any[] = [];
      
      for (const voter of allVoters) {
        const voterData = {
          voters_id: voter.voters_id,
          student_id: voter.student_id,
          fullname: `${voter.firstname} ${voter.lastname}`,
          department: voter.department,
          course: voter.course,
          year_level: voter.year_level,
          email: voter.email,
        };
        
        if (votedStudentIds.has(voter.student_id)) {
          voted.push(voterData);
        } else {
          notVoted.push(voterData);
        }
      }
      
      return {
        success: true,
        message: 'Voting history retrieved successfully',
        data: {
          election_type,
          totalVoters: allVoters.length,
          votedCount: voted.length,
          notVotedCount: notVoted.length,
          voted,
          notVoted,
        },
      };
    } catch (error) {
      console.error('Error retrieving voting history:', error);
      return {
        success: false,
        message: 'Failed to retrieve voting history',
        data: null,
      };
    }
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} smartVote`;
  // }
}

//* stored procedure call examples in service file:

//? adminLogin
/**
 BEGIN
  -- Query to find the voter by student_id
    SELECT *
    FROM test_Test.admins
    WHERE admin_id = _admin_id AND `password`=_password;
END
 */

//? createAdmin
/*BEGIN

    -- Check if the admin_id already exists in the table
    IF EXISTS (SELECT 1 FROM test_Test.admins WHERE admin_id = _admin_id) THEN
        -- If the admin_id exists, exit the procedure and return an error or message
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Admin ID already exists';
    ELSE
        -- If admin_id does not exist, proceed with the insert
      INSERT INTO test_Test.admins (admin_id, `password`, fullname, email, departments, `position`, `role`, added_by, date_added) 
		VALUES (_admin_id, _password, _fullname, _email, _departments, _position, 'ADMIN', _added_by, NOW());
    END IF;

END */

//? deleteAdmin
/* BEGIN
DELETE FROM test_Test.admins WHERE admin_id = _admin_id;
END */

//? updateAdmin
/**
 BEGIN
UPDATE test_Test.admins 
SET fullname = _fullname,
	 email = _email,
	`position` = _position,
	 departments = _departments
	 WHERE admin_id = _admin_id;
END
 */

//? getAdmins
/**
 BEGIN
SELECT * FROM test_Test.admins;
END
 */

//?findStudent:
/* BEGIN
 SELECT * FROM test_Test.table0 WHERE student_id = _student_id AND firstname = _firstname;  
 END */

//?insertCandidate:
/* BEGIN
    -- Check if the student_id already exists in the table
    IF EXISTS (SELECT 1 FROM test_Test.table1 WHERE student_id = _student_id) THEN
        -- If the student_id exists, exit the procedure and return an error or message
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student ID already exists';
    ELSE
        -- If student_id does not exist, proceed with the insert
        INSERT INTO test_Test.table1 (student_id, firstname, lastname, gender, course, `year`, email,
            `position`, election_type, party, `status`, filed_date) 
        VALUES (_student_id, _firstname, _lastname, _gender, 
            _course, _year, _email,
            _position, _election_type, _party, _status, _filed_date);
    END IF;
END*/

//? findCandidates
/*
BEGIN
SELECT * FROM test_Test.table1 WHERE student_id = _student_id;
END
*/

//? getCandidates
/*
BEGIN
SELECT * FROM test_Test.table1 WHERE election_type = _election_type AND YEAR(filed_date) = YEAR(NOW());
END
*/

//? updateCandidate
/*
BEGIN
UPDATE test_Test.table1
SET `status` = _status,
	 approver_remarks = _remarks
	 WHERE student_id = _student_id;
END
*/

//?insertVoters;
/*
BEGIN


DECLARE v_year CHAR(4);
    DECLARE v_max_seq INT;
    DECLARE v_new_seq INT;
    DECLARE v_voters_id VARCHAR(20);
    
    SET v_year = YEAR(CURDATE());

    -- Get max sequence number for current year, or 0 if none
    SELECT COALESCE(
        MAX(CAST(SUBSTRING_INDEX(voters_id, '-', -1) AS UNSIGNED)),
        0
    )
    INTO v_max_seq
    FROM test_Test.table3
    WHERE voters_id LIKE CONCAT('VOTER-', v_year, '-%');
    SET v_new_seq = v_max_seq + 1;
    SET v_voters_id = CONCAT('VOTER-', v_year, '-', LPAD(v_new_seq, 3, '0'));


    -- Check if the student_id already exists in the table
    IF EXISTS (SELECT 1 FROM test_Test.table3 WHERE student_id = _student_id) THEN
        -- If the student_id exists, exit the procedure and return an error or message
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student ID already exists';
    ELSE
        -- If student_id does not exist, proceed with the insert
        INSERT INTO test_Test.table3 (student_id, voters_id, firstname, lastname, department, email, `password`, registered_at) 
        VALUES (_student_id, v_voters_id, _firstname, _lastname, _department, _email, _password,
         NOW());
    END IF;
END*/

//?getCandidacySchedule
/*
BEGIN
SELECT * FROM test_Test.table2 WHERE candidacy_type = _candidacy_type;
END
*/

//?updateCandidacy:
/*BEGIN
UPDATE test_Test.table2 
SET 
	 open_date = NOW(),
	 close_date = _close_date,
	 `status` = _status,
	 opened_by = _opened_by
	 WHERE candidacy_type = candidacy_type;
	 
	  -- Optionally return the number of affected rows
  #SELECT ROW_COUNT() AS rows_affected;
END*/

//?getElectionSchedule
/*
BEGIN
SELECT * FROM test_Test.table4 WHERE election_type = _election_type;
END
*/

//?updateElection:
/**
BEGIN
UPDATE test_Test.table4 
SET 
	 open_date = NOW(),
	 close_date = _close_date,
	 `status` = _status,
	 opened_by = _opened_by
	 WHERE election_type = _election_type;
	 
	  -- Optionally return the number of affected rows
  #SELECT ROW_COUNT() AS rows_affected;
END
 */

//?votersLogin
/*BEGIN
  -- Query to find the voter by student_id
    SELECT student_id, `password`
    FROM test_Test.table3
    WHERE student_id = _student_id;
END*/

//? getApprovedCandidates
/*BEGIN
SELECT * FROM test_Test.table1 WHERE election_type = _election_type AND `status` = "APPROVED" AND YEAR(filed_date) = YEAR(NOW());
END */

//? insertVotes
/*BEGIN

    -- Check if the student_id already exists in the table
    IF EXISTS (SELECT 1 FROM test_Test.table5 WHERE student_id = _student_id AND election_type = _election_type ) THEN
        -- If the student_id exists, exit the procedure and return an error or message
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Student Already Voted';
    ELSE
        -- If student_id does not exist, proceed with the insert
       INSERT INTO test_Test.table5 (student_id, voters_id, fullname, email, department, election_type, president, vice_president, secretary, voted_date)
		 VALUES (_student_id, _voters_id, _fullname, _email, _department, _election_type, _president, _vice_president, _secretary, NOW());
    END IF;

END

*/

//? getVoteHistory
/*
BEGIN
SELECT * FROM test_Test.table5 WHERE student_id = _student_id AND voters_id = _voters_id;
END
*/

//Database

//?StudentDb
/**
  CREATE TABLE `table0` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`student_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`firstname` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;
 */

//?CandidatesDb
/**
CREATE TABLE `candidates` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`student_id` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`firstname` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`lastname` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`email` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`department` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`position` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`party` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`about_yourself` LONGTEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`purpose` LONGTEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`election_type` VARCHAR(50) NOT NULL DEFAULT '' COLLATE 'latin1_swedish_ci',
	`status` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`approver_remarks` LONGTEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`filed_date` DATE NOT NULL DEFAULT '0000-00-00',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=13
;


 */

//?CandidacyDb
/**
 CREATE TABLE `table2` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`candidacy_type` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`open_date` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`close_date` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`status` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`opened_by` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;

 */

//?ElectionDb
/**
 CREATE TABLE `table4` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`election_type` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`open_date` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`close_date` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`status` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`opened_by` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;

 */

//?VotersDb
/**
 CREATE TABLE `table3` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`student_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`voters_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`firstname` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`lastname` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`department` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`email` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`password` VARCHAR(250) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`registered_at` DATE NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=15
;

 */

//? AdminDb
/*
CREATE TABLE `admins` (
	`id` INT(10) NOT NULL AUTO_INCREMENT,
	`admin_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`role` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`password` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`fullname` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`email` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`departments` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`position` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`added_by` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`date_added` DATE NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=25
;
*/

//?VoteHistory
// CREATE TABLE `votehitory` (
// 	`id` INT(10) NOT NULL AUTO_INCREMENT,
// 	`student_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`voters_id` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`fullname` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`email` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`department` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`election_type` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`president` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`vice_president` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`secretary` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
// 	`voted_date` DATE NULL DEFAULT NULL,
// 	PRIMARY KEY (`id`) USING BTREE
// )
// COLLATE='latin1_swedish_ci'
// ENGINE=InnoDB
// AUTO_INCREMENT=18
// ;
