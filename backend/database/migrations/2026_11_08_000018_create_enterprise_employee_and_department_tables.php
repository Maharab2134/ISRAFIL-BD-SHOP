<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Departments Table
        if (!Schema::hasTable('departments')) {
            Schema::create('departments', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('name_bn')->nullable();
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->foreignId('head_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->string('status')->default('active')->index(); // 'active', 'inactive'
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 2. Designations Table
        if (!Schema::hasTable('designations')) {
            Schema::create('designations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->string('name');
                $table->string('name_bn')->nullable();
                $table->string('code')->nullable();
                $table->text('description')->nullable();
                $table->string('status')->default('active')->index(); // 'active', 'inactive'
                $table->timestamps();
                $table->softDeletes();
            });
        }

        // 3. Add Extended HR Columns to Users Table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'department_id')) {
                $table->foreignId('department_id')->nullable()->after('branch_id')->constrained('departments')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'designation_id')) {
                $table->foreignId('designation_id')->nullable()->after('department_id')->constrained('designations')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'reporting_manager_id')) {
                $table->foreignId('reporting_manager_id')->nullable()->after('designation_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('users', 'employment_type')) {
                $table->string('employment_type')->default('full_time')->after('reporting_manager_id'); // full_time, part_time, contract, temporary, probation
            }
            if (!Schema::hasColumn('users', 'father_name')) {
                $table->string('father_name')->nullable()->after('employment_type');
            }
            if (!Schema::hasColumn('users', 'mother_name')) {
                $table->string('mother_name')->nullable()->after('father_name');
            }
            if (!Schema::hasColumn('users', 'dob')) {
                $table->date('dob')->nullable()->after('mother_name');
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $table->string('gender')->nullable()->after('dob'); // male, female, other
            }
            if (!Schema::hasColumn('users', 'present_address')) {
                $table->text('present_address')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users', 'permanent_address')) {
                $table->text('permanent_address')->nullable()->after('present_address');
            }
            if (!Schema::hasColumn('users', 'emergency_contact_name')) {
                $table->string('emergency_contact_name')->nullable()->after('permanent_address');
            }
            if (!Schema::hasColumn('users', 'emergency_contact_phone')) {
                $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_name');
            }
            if (!Schema::hasColumn('users', 'emergency_contact_relation')) {
                $table->string('emergency_contact_relation')->nullable()->after('emergency_contact_phone');
            }
            if (!Schema::hasColumn('users', 'salary')) {
                $table->decimal('salary', 12, 2)->nullable()->after('emergency_contact_relation');
            }
        });

        // 4. Work Shifts Table
        if (!Schema::hasTable('work_shifts')) {
            Schema::create('work_shifts', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('name_bn')->nullable();
                $table->string('shift_code')->unique();
                $table->time('start_time');
                $table->time('end_time');
                $table->string('status')->default('active'); // active, inactive
                $table->timestamps();
            });
        }

        // 5. Employee Attendances Table
        if (!Schema::hasTable('employee_attendances')) {
            Schema::create('employee_attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('shift_id')->nullable()->constrained('work_shifts')->nullOnDelete();
                $table->date('date')->index();
                $table->time('check_in')->nullable();
                $table->time('check_out')->nullable();
                $table->string('status')->default('present')->index(); // present, absent, late, half_day, on_leave, holiday
                $table->integer('late_minutes')->default(0);
                $table->decimal('working_hours', 5, 2)->default(0);
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->unique(['user_id', 'date']);
            });
        }

        // 6. Employee Transfers Table
        if (!Schema::hasTable('employee_transfers')) {
            Schema::create('employee_transfers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('from_branch_id')->nullable()->constrained('branches')->nullOnDelete();
                $table->foreignId('to_branch_id')->constrained('branches')->cascadeOnDelete();
                $table->foreignId('from_department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->foreignId('to_department_id')->nullable()->constrained('departments')->nullOnDelete();
                $table->date('transfer_date');
                $table->text('reason')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status')->default('completed'); // completed, pending, rejected
                $table->timestamps();
            });
        }

        // 7. Employee Status Histories Table
        if (!Schema::hasTable('employee_status_histories')) {
            Schema::create('employee_status_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('previous_status');
                $table->string('new_status');
                $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->text('reason')->nullable();
                $table->date('effective_date');
                $table->timestamps();
            });
        }

        // 8. Employee Documents Table
        if (!Schema::hasTable('employee_documents')) {
            Schema::create('employee_documents', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->string('document_type')->default('other'); // appointment_letter, nid, passport, certificate, contract, other
                $table->string('file_path');
                $table->string('file_name')->nullable();
                $table->string('file_size')->nullable();
                $table->text('notes')->nullable();
                $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('employee_status_histories');
        Schema::dropIfExists('employee_transfers');
        Schema::dropIfExists('employee_attendances');
        Schema::dropIfExists('work_shifts');

        Schema::table('users', function (Blueprint $table) {
            $cols = [
                'department_id',
                'designation_id',
                'reporting_manager_id',
                'employment_type',
                'father_name',
                'mother_name',
                'dob',
                'gender',
                'present_address',
                'permanent_address',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relation',
                'salary',
            ];
            foreach ($cols as $c) {
                if (Schema::hasColumn('users', $c)) {
                    $table->dropColumn($c);
                }
            }
        });

        Schema::dropIfExists('designations');
        Schema::dropIfExists('departments');
    }
};

