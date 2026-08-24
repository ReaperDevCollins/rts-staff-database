/* =====================================================
   RTS STAFF DATABASE
   SUPABASE VERSION
===================================================== */


/* =====================================================
   SUPABASE CONFIGURATION
===================================================== */

const SUPABASE_URL =
    "https://aqrqfbwktwdhpfvcethy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_yx-KgW6xvRxogF-CSLYVfg_uM6Hh7ws";

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
    const ADMIN_EMAIL = "devmccollins@gmail.com";

const RESET_PASSWORD_URL =
    "https://reaperdevcollins.github.io/rts-staff-database/reset-password.html";

async function sendPasswordReset(email) {

    const { error } =
        await supabaseClient.auth.resetPasswordForEmail(
            email,
            { redirectTo: RESET_PASSWORD_URL }
        );

    return error;

}
/* =====================================================
   CHECK EDITOR AUTHORIZATION
===================================================== */

async function isAuthorizedEditor(userId) {

    if (!userId) {
        return false;
    }

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("editors")
            .select("id")
            .eq("id", userId)
            .maybeSingle();

        if (error) {

            console.error(
                "Editor authorization error:",
                error
            );

            return false;
        }

        return !!data;

    }

    catch (error) {

        console.error(
            "Unexpected editor authorization error:",
            error
        );

        return false;
    }

}

/* =====================================================
   DEFAULT OPTIONS
===================================================== */

const defaultRanks = [
    "Administrator",
    "Moderator",
    "Senior Staff",
    "Staff"
];

const defaultStatuses = [
    "Active",
    "Resigned",
    "Terminated"
];


/* =====================================================
   RANK CONFIGURATION (SUPABASE)
===================================================== */

let rankDatabase = [];

async function loadRankDatabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("ranks")
                .select("*")
                .order("created_at", { ascending: true });

        if (error) {
            console.error("Supabase rank loading error:", error);
            rankDatabase = [];
            return [];
        }

        rankDatabase = (data || []).map(rank => ({
            id: rank.id,
            name: rank.name || "",
            logoUrl: rank.logo_url || ""
        }));

        return rankDatabase;

    } catch (error) {
        console.error("Unexpected Supabase rank error:", error);
        rankDatabase = [];
        return [];
    }

}


/* =====================================================
   DATABASE ARRAYS
===================================================== */

let staffDatabase = [];

let departmentDatabase = [];


/* =====================================================
   MAP DEPARTMENT
===================================================== */

function mapDepartment(department) {

    return {

        id:
            department.id,

        name:
            department.name || "",

        description:
            department.description || "",

        logoUrl:
            department.logo_url || "",

        head:
            department.head || "",

        seniorStaff:
            department.senior_staff || ""

    };

}


/* =====================================================
   LOAD STAFF
===================================================== */

async function loadStaffDatabase() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("staff")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "Supabase staff loading error:",
                error
            );

            return [];

        }

        staffDatabase =
            (data || []).map(
                member => ({

                    id:
                        member.id,

                    username:
                        member.username || "",

                    rank:
                        member.rank || "",

                    status:
                        member.status || "",

                    department:
                        member.department || "",

                    avatarUrl:
                        member.avatar_url || "",

                    robloxId:
                        member.roblox_id || "",

                    startDate:
                        member.start_date || "",

                    endDate:
                        member.end_date || ""

                })
            );

        return staffDatabase;

    }

    catch (error) {

        console.error(
            "Unexpected Supabase staff error:",
            error
        );

        return [];

    }

}


/* =====================================================
   LOAD DEPARTMENTS
===================================================== */

async function loadDepartmentDatabase() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("departments")
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "Supabase department loading error:",
                error
            );

            departmentDatabase = [];

            return [];

        }

        departmentDatabase =
            (data || []).map(
                mapDepartment
            );

        return departmentDatabase;

    }

    catch (error) {

        console.error(
            "Unexpected Supabase department error:",
            error
        );

        departmentDatabase = [];

        return [];

    }

}


/* =====================================================
   SERVICE LENGTH
===================================================== */

function calculateServiceDays(
    startDate,
    endDate
) {

    if (!startDate) {
        return 0;
    }

    const start =
        new Date(
            `${startDate}T00:00:00`
        );

    const end =
        endDate
            ? new Date(
                `${endDate}T00:00:00`
            )
            : new Date();

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return 0;
    }

    const difference =
        end.getTime() -
        start.getTime();

    return Math.max(
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        ),
        0
    );

}

let statusDatabase = [];

async function loadStatusDatabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("statuses")
                .select("*")
                .order("created_at", { ascending: true });

        if (error) {
            console.error("Supabase status loading error:", error);
            statusDatabase = [];
            return [];
        }

        statusDatabase = (data || []).map(status => ({
            id: status.id,
            name: status.name || "",
            color: status.color || "#5865f2"
        }));

        return statusDatabase;

    } catch (error) {
        console.error("Unexpected Supabase status error:", error);
        statusDatabase = [];
        return [];
    }

}

function getStatusColor(statusName) {

    const match = statusDatabase.find(
        status => status.name.toLowerCase() === (statusName || "").toLowerCase()
    );

    return match ? match.color : "#858b98";

}

/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


/* =====================================================
   SAFE LOGO URL
===================================================== */

function getSafeLogoUrl(url) {

    if (!url) {
        return "";
    }

    try {

        const parsed =
            new URL(url);

        if (
            parsed.protocol !== "http:" &&
            parsed.protocol !== "https:"
        ) {
            return "";
        }

        return parsed.href;

    }

    catch {
        return "";
    }

}


/* =====================================================
   STAFF STATISTICS
===================================================== */

function updateStatistics() {

    const total =
        staffDatabase.length;

    const active =
        staffDatabase.filter(
            staff =>
                staff.status === "Active"
        ).length;

    const terminations =
        staffDatabase.filter(
            staff =>
                staff.status === "Terminated"
        ).length;

    const resignations =
        staffDatabase.filter(
            staff =>
                staff.status === "Resigned"
        ).length;

    const totalElement =
        document.getElementById(
            "totalPersonnel"
        );

    const activeElement =
        document.getElementById(
            "activePersonnel"
        );

    const terminationElement =
        document.getElementById(
            "terminationCount"
        );

    const resignationElement =
        document.getElementById(
            "resignationCount"
        );

    if (totalElement) {
        totalElement.textContent = total;
    }

    if (activeElement) {
        activeElement.textContent = active;
    }

    if (terminationElement) {
        terminationElement.textContent = terminations;
    }

    if (resignationElement) {
        resignationElement.textContent = resignations;
    }

}


/* =====================================================
   STAFF FILTER OPTIONS
===================================================== */

function loadFilterOptions() {

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const rankFilter =
        document.getElementById(
            "rankFilter"
        );

    const departmentFilter =
        document.getElementById(
            "departmentFilter"
        );


        if (statusFilter) {

            statusFilter.innerHTML =
                `<option value="all">All Statuses</option>`;
    
            statusDatabase.forEach(status => {
    
                const option =
                    document.createElement("option");
    
                option.value = status.name;
                option.textContent = status.name;
    
                statusFilter.appendChild(option);
    
            });
    
        }


    if (rankFilter) {

        rankFilter.innerHTML =
            `<option value="all">All Ranks</option>`;

        rankDatabase.forEach(rank => {

            const option =
                document.createElement("option");

            option.value = rank.name;
            option.textContent = rank.name;

            rankFilter.appendChild(option);

        });

    }


    if (departmentFilter) {

        departmentFilter.innerHTML =
            `<option value="all">All Departments</option>`;

        departmentDatabase.forEach(
            department => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    department.name;

                option.textContent =
                    department.name;

                departmentFilter.appendChild(
                    option
                );

            }
        );

    }

}


/* =====================================================
   DISPLAY STAFF
===================================================== */

function displayStaff() {

    const container =
        document.getElementById(
            "staffList"
        );

    if (!container) {
        return;
    }

    const search =
        document.getElementById(
            "staffSearch"
        )?.value
        ?.toLowerCase()
        || "";

    const status =
        document.getElementById(
            "statusFilter"
        )?.value
        || "all";

    const rank =
        document.getElementById(
            "rankFilter"
        )?.value
        || "all";

    const department =
        document.getElementById(
            "departmentFilter"
        )?.value
        || "all";


    const filteredStaff =
        staffDatabase.filter(
            staff => {

                const matchesSearch =
                    staff.username
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    status === "all" ||
                    staff.status === status;

                const matchesRank =
                    rank === "all" ||
                    staff.rank === rank;

                const matchesDepartment =
                    department === "all" ||
                    staff.department === department;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesRank &&
                    matchesDepartment
                );

            }
        );


    container.innerHTML = "";


    if (
        filteredStaff.length === 0
    ) {

        container.innerHTML = `

            <div class="staff-empty">

                <h3>
                    No Staff Found
                </h3>

                <p>
                    No personnel match your current filters.
                </p>

            </div>

        `;

        return;

    }


    filteredStaff.forEach(
        staff => {

            const serviceDays =
                calculateServiceDays(
                    staff.startDate,
                    staff.endDate
                );

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "staff-row";

            row.innerHTML = `

                <div>

                    <div
                        class="staff-username"
                        style="cursor:pointer;"
                        onclick="openEmployeeFile('${staff.id}')"
                    >

                        ${escapeHTML(
                            staff.username
                        )}

                    </div>

                </div>

                <div class="staff-rank" style="display:flex; align-items:center; gap:8px;">

                    ${
                        getRankLogo(staff.rank)
                            ? `<img src="${escapeHTML(getRankLogo(staff.rank))}" alt="" style="width:20px; height:20px; object-fit:contain; border-radius:5px;">`
                            : ""
                    }

                    <span>${escapeHTML(
                        staff.rank
                    )}</span>

                </div>

                <div>

                <div>

                    <span
                        class="staff-status"
                        style="background:${escapeHTML(getStatusColor(staff.status))}33; color:${escapeHTML(getStatusColor(staff.status))};"
                    >

                        ${escapeHTML(staff.status)}

                    </span>

                </div>

                <div class="staff-department-cell">

                    ${
                        getDepartmentLogo(staff.department)
                            ? `<img src="${escapeHTML(getDepartmentLogo(staff.department))}" alt="" class="staff-department-logo">`
                            : ""
                    }

                    <span>${escapeHTML(staff.department)}</span>

                </div>

                <div class="staff-date">

                    ${formatDate(
                        staff.startDate
                    )}

                </div>

                <div class="staff-date">

                    ${
                        staff.endDate
                            ? formatDate(
                                staff.endDate
                            )
                            : "—"
                    }

                </div>

                <div class="staff-service">

                    ${serviceDays} Days

                </div>

            `;

            container.appendChild(row);

        }
    );

}


/* =====================================================
   STAFF FILTER EVENTS
===================================================== */

function setupFilters() {

    const search =
        document.getElementById(
            "staffSearch"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );

    const rank =
        document.getElementById(
            "rankFilter"
        );

    const department =
        document.getElementById(
            "departmentFilter"
        );


    if (search) {
        search.addEventListener(
            "input",
            displayStaff
        );
    }

    if (status) {
        status.addEventListener(
            "change",
            displayStaff
        );
    }

    if (rank) {
        rank.addEventListener(
            "change",
            displayStaff
        );
    }

    if (department) {
        department.addEventListener(
            "change",
            displayStaff
        );
    }

}


/* =====================================================
   INITIALIZE STAFF PAGE
===================================================== */

async function initializeStaffPage() {

    const staffList =
        document.getElementById(
            "staffList"
        );

    if (!staffList) {
        return;
    }

    await loadDepartmentDatabase();

    await loadStaffDatabase();

    await loadSpotlightCounts();

    await loadDepartmentHistoryDatabase();

    loadFilterOptions();

    setupFilters();

    updateStatistics();

    displayStaff();

}


/* =====================================================
   EDITOR LOGIN
===================================================== */

function setupEditorLogin() {

    const editorLoginForm =
        document.getElementById(
            "editorLoginForm"
        );

    if (!editorLoginForm) {
        return;
    }


    editorLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "editorEmail"
                )?.value
                ?.trim();

            const password =
                document.getElementById(
                    "editorPassword"
                )?.value;

            const error =
                document.getElementById(
                    "editorLoginError"
                );


            if (error) {
                error.textContent = "";
            }


            if (!email || !password) {

                if (error) {
                    error.textContent =
                        "Please enter your email and password.";
                }

                return;

            }


            const button =
                editorLoginForm.querySelector(
                    "button[type='submit']"
                );


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Signing In...";

            }


            try {

                const {
                    data,
                    error: loginError
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                email,

                            password:
                                password

                        });


                if (loginError) {

                    if (error) {
                        error.textContent =
                            loginError.message ||
                            "Incorrect email or password.";
                    }

                    return;

                }


                if (!data.session) {

                    if (error) {
                        error.textContent =
                            "Login failed. No session was created.";
                    }

                    return;

                }


                const authorized =
                await isAuthorizedEditor(data.user.id);
            
            if (!authorized) {
            
                await supabaseClient.auth.signOut();
            
                if (error) {
                    error.textContent =
                        "You are not authorized to access the editor.";
                }
            
                return;
            
            }


                sessionStorage.setItem(
                    "rtsEditorLoggedIn",
                    "true"
                );


                await showEditorPanel();

            }

            catch (loginException) {

                console.error(
                    loginException
                );

                if (error) {
                    error.textContent =
                        "Unable to connect to Supabase.";
                }

            }

            finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Sign In";

                }

            }

        }
    );

}


/* =====================================================
   SHOW EDITOR PANEL
===================================================== */

async function showEditorPanel() {

    const login =
        document.getElementById(
            "editorLogin"
        );

    const panel =
        document.getElementById(
            "editorPanel"
        );

    if (!login || !panel) {
        return;
    }


    login.classList.add("hidden");

    panel.classList.remove("hidden");


    await loadDepartmentDatabase();

    await loadStaffDatabase();


    populateStaffFormOptions();

    displayEditorStaff();

    displayDepartmentManagement();

    displayRankManagement();

    displayStatusManagement();

    await loadSpotlightDatabase();

    refreshSpotlightUI();

}


/* =====================================================
   EDITOR LOGOUT
===================================================== */

async function editorLogout() {

    await supabaseClient.auth.signOut();

    sessionStorage.removeItem(
        "rtsEditorLoggedIn"
    );

    location.reload();

}


/* =====================================================
   CHECK EDITOR SESSION
===================================================== */

async function checkEditorSession() {

    const login =
        document.getElementById(
            "editorLogin"
        );

    const panel =
        document.getElementById(
            "editorPanel"
        );

    if (!login || !panel) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            console.error(
                "Unable to check authentication:",
                error
            );

            showEditorLogin();

            return;

        }


        const session =
            data?.session;


        if (!session) {

            showEditorLogin();

            return;

        }


        const authorized =
        await isAuthorizedEditor(
            session.user.id
        );
    
    if (!authorized) {
    
        await supabaseClient.auth.signOut();
    
        showEditorLogin();
    
        return;
    
    }


        await showEditorPanel();

    }

    catch (error) {

        console.error(
            "Editor authentication error:",
            error
        );

        showEditorLogin();

    }

}


/* =====================================================
   SHOW EDITOR LOGIN
===================================================== */

function showEditorLogin() {

    const login =
        document.getElementById(
            "editorLogin"
        );

    const panel =
        document.getElementById(
            "editorPanel"
        );

    if (!login || !panel) {
        return;
    }

    panel.classList.add("hidden");

    login.classList.remove("hidden");

}


/* =====================================================
   DISPLAY EDITOR STAFF
===================================================== */

function displayEditorStaff() {

    const container =
        document.getElementById(
            "editorStaffList"
        );

    if (!container) {
        return;
    }


    const search =
        document.getElementById(
            "editorStaffSearch"
        )?.value
        ?.toLowerCase()
        || "";


    const filtered =
        staffDatabase.filter(
            member =>
                member.username
                    .toLowerCase()
                    .includes(search)
        );


    container.innerHTML = "";


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `

            <div class="editor-empty">

                No staff members found.

            </div>

        `;

        return;

    }


    filtered.forEach(
        member => {

            const service =
                calculateServiceDays(
                    member.startDate,
                    member.endDate
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "editor-staff-item";


            item.innerHTML = `

                <div>

                    <div class="editor-staff-username">

                        ${escapeHTML(
                            member.username
                        )}

                    </div>

                </div>


                <div class="editor-staff-detail" style="display:flex; align-items:center; gap:6px;">

                    ${
                        getRankLogo(member.rank)
                            ? `<img src="${escapeHTML(getRankLogo(member.rank))}" alt="" style="width:16px; height:16px; object-fit:contain; border-radius:4px;">`
                            : ""
                    }

                    <span>${escapeHTML(
                        member.rank
                    )}</span>

                </div>


                        <div class="editor-staff-detail">

                    <span
                        class="staff-status"
                        style="background:${escapeHTML(getStatusColor(member.status))}33; color:${escapeHTML(getStatusColor(member.status))};"
                    >

                        ${escapeHTML(member.status)}

                    </span>

                </div>


                <div class="editor-staff-detail">

                    ${escapeHTML(
                        member.department
                    )}

                </div>


                <div class="editor-staff-detail">

                    ${formatDate(
                        member.startDate
                    )}

                </div>


                <div class="editor-staff-detail">

                    ${
                        member.endDate
                            ? formatDate(
                                member.endDate
                            )
                            : "Current"
                    }

                </div>


                <div class="editor-staff-service">

                    ${service} Days

                </div>


                <div class="editor-staff-actions">

                    <button
                        class="editor-action-button"
                        onclick="editStaffMember('${member.id}')"
                    >
                        Edit
                    </button>


                    <button
                        class="editor-action-button delete"
                        onclick="deleteStaffMember('${member.id}')"
                    >
                        Delete
                    </button>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


/* =====================================================
   STAFF FORM OPTIONS
===================================================== */

function populateStaffFormOptions() {

    const rank =
        document.getElementById(
            "staffRank"
        );

    const status =
        document.getElementById(
            "staffStatus"
        );

    const department =
        document.getElementById(
            "staffDepartment"
        );


    if (!rank || !status || !department) {
        return;
    }


    rank.innerHTML = "";

    status.innerHTML = "";

    department.innerHTML = "";


    rankDatabase.forEach(value => {

        const option =
            document.createElement("option");

        option.value = value.name;
        option.textContent = value.name;

        rank.appendChild(option);

    });


    statusDatabase.forEach(
        value => {

            const option =
                document.createElement("option");

            option.value = value.name;
            option.textContent = value.name;

            status.appendChild(option);

        }
    );


    departmentDatabase.forEach(
        departmentData => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                departmentData.name;

            option.textContent =
                departmentData.name;

            department.appendChild(option);

        }
    );

}


/* =====================================================
   STAFF FORM
===================================================== */

let editingStaffId = null;


function openStaffForm(
    staffId = null
) {

    const modal =
        document.getElementById(
            "staffFormModal"
        );

    const form =
        document.getElementById(
            "staffForm"
        );


    if (!modal || !form) {
        return;
    }


    populateStaffFormOptions();

    editingStaffId =
        staffId;

    form.reset();


    if (staffId !== null) {

        const member =
            staffDatabase.find(
                item =>
                    String(item.id) ===
                    String(staffId)
            );


        if (!member) {

            alert(
                "Staff member could not be found."
            );

            return;

        }


        document.getElementById(
            "staffFormTitle"
        ).textContent =
            "Edit Staff Member";


        document.getElementById(
            "staffUsername"
        ).value =
            member.username;


        document.getElementById(
            "staffAvatarUrl"
        ).value =
            member.avatarUrl || "";


        document.getElementById(
            "staffRobloxId"
        ).value =
            member.robloxId || "";


        document.getElementById(
            "staffRank"
        ).value =
            member.rank;


        document.getElementById(
            "staffStatus"
        ).value =
            member.status;


        document.getElementById(
            "staffDepartment"
        ).value =
            member.department;


        document.getElementById(
            "staffStartDate"
        ).value =
            member.startDate;


        document.getElementById(
            "staffEndDate"
        ).value =
            member.endDate || "";


        updateServicePreview();

        updateStaffAvatarPreview();

        populateHistoryFormOptions();

        displayStaffHistoryManagement(staffId);

        const historySection = document.getElementById("staffHistorySection");
        if (historySection) historySection.classList.remove("hidden");

    }

    else {

        document.getElementById(
            "staffFormTitle"
        ).textContent =
            "Add Staff Member";

        updateServicePreview();

        updateStaffAvatarPreview();

        const historySection = document.getElementById("staffHistorySection");
        if (historySection) historySection.classList.add("hidden");

    }


    modal.classList.remove("hidden");

}


/* =====================================================
   CLOSE STAFF FORM
===================================================== */

function closeStaffForm() {

    const modal =
        document.getElementById(
            "staffFormModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    editingStaffId =
        null;

}


/* =====================================================
   SAVE STAFF MEMBER
===================================================== */

function setupStaffForm() {

    const staffForm =
        document.getElementById(
            "staffForm"
        );

    if (!staffForm) {
        return;
    }


    staffForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document.getElementById(
                    "staffUsername"
                ).value.trim();

            const rank =
                document.getElementById(
                    "staffRank"
                ).value;

            const status =
                document.getElementById(
                    "staffStatus"
                ).value;

            const department =
                document.getElementById(
                    "staffDepartment"
                ).value;

            const avatarUrl =
                document.getElementById(
                    "staffAvatarUrl"
                )?.value
                ?.trim()
                || "";

            const robloxId =
                document.getElementById(
                    "staffRobloxId"
                )?.value
                ?.trim()
                || "";

            const startDate =
                document.getElementById(
                    "staffStartDate"
                ).value;

            const endDate =
                document.getElementById(
                    "staffEndDate"
                ).value;


            if (!username) {

                alert(
                    "Please enter a Roblox username."
                );

                return;

            }


            if (!rank) {

                alert(
                    "Please select a rank."
                );

                return;

            }


            if (!status) {

                alert(
                    "Please select a status."
                );

                return;

            }


            if (!department) {

                alert(
                    "Please select a department."
                );

                return;

            }


            if (!startDate) {

                alert(
                    "Please enter a start date."
                );

                return;

            }


            if (
                endDate &&
                endDate < startDate
            ) {

                alert(
                    "The end date cannot be before the start date."
                );

                return;

            }


            const saveButton =
                staffForm.querySelector(
                    "button[type='submit']"
                );


            if (saveButton) {

                saveButton.disabled = true;

                saveButton.textContent =
                    "Saving...";

            }


            try {

                if (
                    editingStaffId !== null
                ) {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("staff")
                            .update({

                                username:
                                    username,

                                rank:
                                    rank,

                                status:
                                    status,

                                department:
                                    department,

                                avatar_url:
                                    avatarUrl || null,

                                roblox_id:
                                    robloxId || null,

                                start_date:
                                    startDate,

                                end_date:
                                    endDate || null,

                                updated_at:
                                    new Date().toISOString()

                            })
                            .eq(
                                "id",
                                editingStaffId
                            )
                            .select()
                            .single();


                    if (error) {

                        alert(
                            "Unable to update staff member:\n\n" +
                            error.message
                        );

                        return;

                    }


                    if (data) {

                        const index =
                            staffDatabase.findIndex(
                                member =>
                                    String(member.id) ===
                                    String(editingStaffId)
                            );


                        if (index !== -1) {

                            staffDatabase[index] = {

                                id:
                                    data.id,

                                username:
                                    data.username || "",

                                rank:
                                    data.rank || "",

                                status:
                                    data.status || "",

                                department:
                                    data.department || "",

                                avatarUrl:
                                    data.avatar_url || "",

                                robloxId:
                                    data.roblox_id || "",

                                startDate:
                                    data.start_date || "",

                                endDate:
                                    data.end_date || ""

                            };

                        }

                    }

                }

                else {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("staff")
                            .insert({

                                username:
                                    username,

                                rank:
                                    rank,

                                status:
                                    status,

                                department:
                                    department,

                                avatar_url:
                                    avatarUrl || null,

                                roblox_id:
                                    robloxId || null,

                                start_date:
                                    startDate,

                                end_date:
                                    endDate || null

                            })
                            .select()
                            .single();


                    if (error) {

                        alert(
                            "Unable to add staff member:\n\n" +
                            error.message
                        );

                        return;

                    }


                    if (data) {

                        staffDatabase.push({

                            id:
                                data.id,

                            username:
                                data.username || "",

                            rank:
                                data.rank || "",

                            status:
                                data.status || "",

                            department:
                                data.department || "",

                            avatarUrl:
                                data.avatar_url || "",

                            robloxId:
                                data.roblox_id || "",

                            startDate:
                                data.start_date || "",

                            endDate:
                                data.end_date || ""

                        });

                    }

                }


                closeStaffForm();

                displayEditorStaff();

                updateStatistics();

                displayStaff();


                alert(
                    "Staff member saved successfully."
                );

            }

            catch (error) {

                console.error(error);

                alert(
                    "An unexpected error occurred while saving."
                );

            }

            finally {

                if (saveButton) {

                    saveButton.disabled = false;

                    saveButton.textContent =
                        "Save Staff Member";

                }

            }

        }
    );

}


/* =====================================================
   EDIT STAFF
===================================================== */

function editStaffMember(id) {

    openStaffForm(id);

}


/* =====================================================
   DELETE STAFF
===================================================== */

async function deleteStaffMember(id) {

    const member =
        staffDatabase.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!member) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to permanently remove ${member.username} from the database?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("staff")
                .delete()
                .eq("id", id);


        if (error) {

            alert(
                "Unable to delete staff member:\n\n" +
                error.message
            );

            return;

        }


        staffDatabase =
            staffDatabase.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        displayEditorStaff();

        updateStatistics();

        displayStaff();


        alert(
            "Staff member deleted successfully."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "An unexpected error occurred while deleting the staff member."
        );

    }

}


/* =====================================================
   SERVICE PREVIEW
===================================================== */

function updateServicePreview() {

    const start =
        document.getElementById(
            "staffStartDate"
        )?.value;

    const end =
        document.getElementById(
            "staffEndDate"
        )?.value;

    const preview =
        document.getElementById(
            "serviceLengthPreview"
        );


    if (!preview) {
        return;
    }


    preview.textContent =
        `${calculateServiceDays(start, end)} Days`;

}


/* =====================================================
   DEPARTMENT EDITOR
===================================================== */

let editingDepartmentId = null;


/* =====================================================
   DISPLAY DEPARTMENT MANAGEMENT
===================================================== */

function displayDepartmentManagement() {

    const container =
        document.getElementById(
            "departmentManagementList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        departmentDatabase.length === 0
    ) {

        container.innerHTML = `

            <div class="management-empty">

                No departments have been created.

            </div>

        `;

        return;

    }


    departmentDatabase.forEach(
        department => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "management-item";


            const logo =
                getSafeLogoUrl(
                    department.logoUrl
                );


            item.innerHTML = `

                ${
                    logo
                        ? `
                            <img
                                src="${escapeHTML(logo)}"
                                alt=""
                                style="
                                    width:48px;
                                    height:48px;
                                    object-fit:contain;
                                    border-radius:8px;
                                    margin-right:12px;
                                "
                            >
                        `
                        : ""
                }


                <span class="management-name">

                    ${escapeHTML(
                        department.name
                    )}

                </span>


                <div class="management-actions">

                    <button
                        class="management-button"
                        onclick="editDepartment('${department.id}')"
                    >
                        Edit
                    </button>


                    <button
                        class="management-button delete"
                        onclick="removeDepartment('${department.id}')"
                    >
                        Remove
                    </button>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


/* =====================================================
   OPEN DEPARTMENT EDITOR
===================================================== */

function openDepartmentEditor(
    departmentId = null
) {

    const modal =
        document.getElementById(
            "departmentEditorModal"
        );


    if (!modal) {

        alert(
            "Department editor could not be found."
        );

        return;

    }


    editingDepartmentId =
        departmentId;


    const form =
        document.getElementById(
            "departmentForm"
        );


    if (form) {
        form.reset();
    }


    if (
        departmentId !== null
    ) {

        const department =
            departmentDatabase.find(
                item =>
                    String(item.id) ===
                    String(departmentId)
            );


        if (!department) {

            alert(
                "Department could not be found."
            );

            return;

        }


        document.getElementById(
            "departmentEditorTitle"
        ).textContent =
            "Edit Department";


        document.getElementById(
            "departmentName"
        ).value =
            department.name;


        document.getElementById(
            "departmentLogo"
        ).value =
            department.logoUrl;


        document.getElementById(
            "departmentDescription"
        ).value =
            department.description;


        document.getElementById(
            "departmentHead"
        ).value =
            department.head;


        document.getElementById(
            "departmentSeniorStaff"
        ).value =
            department.seniorStaff;


    }

    else {

        document.getElementById(
            "departmentEditorTitle"
        ).textContent =
            "Add Department";

    }


    updateDepartmentLogoPreview();

    modal.classList.remove("hidden");

}


/* =====================================================
   COMPATIBILITY FUNCTION
===================================================== */

function openDepartmentForm(
    departmentId = null
) {

    openDepartmentEditor(
        departmentId
    );

}


/* =====================================================
   CLOSE DEPARTMENT EDITOR
===================================================== */

function closeDepartmentEditor() {

    const modal =
        document.getElementById(
            "departmentEditorModal"
        );


    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    editingDepartmentId =
        null;

}


/* =====================================================
   COMPATIBILITY FUNCTION
===================================================== */

function closeDepartmentForm() {

    closeDepartmentEditor();

}


/* =====================================================
   DEPARTMENT LOGO PREVIEW
===================================================== */

function updateDepartmentLogoPreview() {

    const input =
        document.getElementById(
            "departmentLogo"
        );

    const preview =
        document.getElementById(
            "departmentLogoPreview"
        );


    if (!input || !preview) {
        return;
    }


    const url =
        getSafeLogoUrl(
            input.value.trim()
        );


    if (!url) {

        preview.innerHTML = `

            <span>
                No Logo
            </span>

        `;

        return;

    }


    preview.innerHTML = `

        <img
            src="${escapeHTML(url)}"
            alt="Department Logo Preview"
            style="
                width:100%;
                height:100%;
                object-fit:contain;
                border-radius:inherit;
            "
        >

    `;


    const image =
        preview.querySelector("img");


    if (image) {

        image.onerror =
            function () {

                preview.innerHTML = `

                    <span>
                        Unable to load logo
                    </span>

                `;

            };

    }

}


/* =====================================================
   STAFF AVATAR PREVIEW
===================================================== */

function updateStaffAvatarPreview() {

    const input = document.getElementById("staffAvatarUrl");
    const preview = document.getElementById("staffAvatarPreview");

    if (!input || !preview) return;

    const url = getSafeLogoUrl(input.value.trim());

    if (!url) {
        preview.innerHTML = `<span>No Picture</span>`;
        return;
    }

    preview.innerHTML = `
        <img
            src="${escapeHTML(url)}"
            alt="Profile Picture Preview"
            style="width:100%; height:100%; object-fit:cover; border-radius:inherit;"
        >
    `;

    const avatarImage = preview.querySelector("img");

    if (avatarImage) {
        avatarImage.onerror = function () {
            preview.innerHTML = `<span>Unable to load image</span>`;
        };
    }

}


/* =====================================================
   SAVE DEPARTMENT
===================================================== */

function setupDepartmentForm() {

    const departmentForm =
        document.getElementById(
            "departmentForm"
        );


    if (!departmentForm) {
        return;
    }


    departmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "departmentName"
                )?.value
                ?.trim();


            const description =
                document.getElementById(
                    "departmentDescription"
                )?.value
                ?.trim()
                || "";


            const logoUrl =
                document.getElementById(
                    "departmentLogo"
                )?.value
                ?.trim()
                || "";


            const head =
                document.getElementById(
                    "departmentHead"
                )?.value
                ?.trim()
                || "";


            const seniorStaff =
                document.getElementById(
                    "departmentSeniorStaff"
                )?.value
                ?.trim()
                || "";


            if (!name) {

                alert(
                    "Please enter a department name."
                );

                return;

            }


            if (
                logoUrl &&
                !getSafeLogoUrl(logoUrl)
            ) {

                alert(
                    "Please enter a valid image URL beginning with http:// or https://."
                );

                return;

            }


            const saveButton =
                departmentForm.querySelector(
                    "button[type='submit']"
                );


            if (saveButton) {

                saveButton.disabled = true;

                saveButton.textContent =
                    "Saving...";

            }


            try {

                if (
                    editingDepartmentId !== null
                ) {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("departments")
                            .update({

                                name:
                                    name,

                                description:
                                    description,

                                logo_url:
                                    logoUrl || null,

                                head:
                                    head || null,

                                senior_staff:
                                    seniorStaff || null,

                                updated_at:
                                    new Date().toISOString()

                            })
                            .eq(
                                "id",
                                editingDepartmentId
                            )
                            .select()
                            .single();


                    if (error) {

                        alert(
                            "Unable to update department:\n\n" +
                            error.message
                        );

                        return;

                    }


                    if (data) {

                        const index =
                            departmentDatabase.findIndex(
                                department =>
                                    String(department.id) ===
                                    String(editingDepartmentId)
                            );


                        if (index !== -1) {

                            departmentDatabase[index] =
                                mapDepartment(data);

                        }

                    }

                }

                else {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("departments")
                            .insert({

                                name:
                                    name,

                                description:
                                    description,

                                logo_url:
                                    logoUrl || null,

                                head:
                                    head || null,

                                senior_staff:
                                    seniorStaff || null

                            })
                            .select()
                            .single();


                    if (error) {

                        alert(
                            "Unable to add department:\n\n" +
                            error.message
                        );

                        return;

                    }


                    if (data) {

                        departmentDatabase.push(
                            mapDepartment(data)
                        );

                    }

                }


                closeDepartmentEditor();


                populateStaffFormOptions();

                loadFilterOptions();

                displayDepartmentManagement();

                displayHomepageDepartments();

                displayDepartmentPage();


                alert(
                    "Department saved successfully."
                );

            }

            catch (error) {

                console.error(error);

                alert(
                    "An unexpected error occurred while saving the department."
                );

            }

            finally {

                if (saveButton) {

                    saveButton.disabled = false;

                    saveButton.textContent =
                        "Save Department";

                }

            }

        }
    );

}


/* =====================================================
   EDIT DEPARTMENT
===================================================== */

function editDepartment(id) {

    openDepartmentEditor(id);

}


/* =====================================================
   REMOVE DEPARTMENT
===================================================== */

async function removeDepartment(id) {

    const department =
        departmentDatabase.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!department) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to remove "${department.name}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("departments")
                .delete()
                .eq("id", id);


        if (error) {

            alert(
                "Unable to delete department:\n\n" +
                error.message
            );

            return;

        }


        departmentDatabase =
            departmentDatabase.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        populateStaffFormOptions();

        loadFilterOptions();

        displayDepartmentManagement();

        displayHomepageDepartments();

        displayDepartmentPage();


        alert(
            "Department removed successfully."
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "An unexpected error occurred while removing the department."
        );

    }

}


/* =====================================================
   DEPARTMENT CARD
===================================================== */

function createDepartmentCard(
    department
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "department-card";


    card.style.cursor =
        "pointer";


    const logo =
        getSafeLogoUrl(
            department.logoUrl
        );


    card.innerHTML = `

        ${
            logo
                ? `
                    <div class="department-logo-container">

                        <img
                            src="${escapeHTML(logo)}"
                            alt="${escapeHTML(department.name)} Logo"
                            class="department-logo"
                        >

                    </div>
                `
                : `
                    <div class="department-logo-container">

                        <div class="department-logo-placeholder">

                            ${escapeHTML(
                                department.name
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>

                    </div>
                `
        }


        <div class="department-card-content">

            <h3>

                ${escapeHTML(
                    department.name
                )}

            </h3>


            <p>

                ${escapeHTML(
                    department.description ||
                    "No description provided."
                )}

            </p>


            ${
                department.head
                    ? `
                        <div class="department-detail">

                            <strong>
                                Department Head
                            </strong>

                            <span>
                                ${escapeHTML(
                                    department.head
                                )}
                            </span>

                        </div>
                    `
                    : ""
            }

        </div>

    `;


    card.addEventListener(
        "click",
        function () {

            window.location.href =
                `department.html?id=${encodeURIComponent(
                    department.id
                )}`;

        }
    );


    return card;

}


/* =====================================================
   DEPARTMENT LIST PAGE
===================================================== */

function displayDepartmentPage() {

    const container =
        document.getElementById(
            "departmentPageList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        departmentDatabase.length === 0
    ) {

        container.innerHTML = `

            <div class="staff-empty">

                <h3>
                    No Departments Found
                </h3>

                <p>
                    No departments have been added yet.
                </p>

            </div>

        `;

        return;

    }


    departmentDatabase.forEach(
        department => {

            container.appendChild(
                createDepartmentCard(
                    department
                )
            );

        }
    );

}


/* =====================================================
   HOMEPAGE EDITORS
===================================================== */
async function displayHomepageEditors() {

    const container = document.getElementById("editorList");

    if (!container) return;

    try {

        const { data, error } =
            await supabaseClient
                .from("editors")
                .select("id, username")
                .order("username", { ascending: true });

        if (error) {
            console.error("Editor directory loading error:", error);
            return;
        }

        container.innerHTML = "";

        if (!data || data.length === 0) {

            container.innerHTML = `
                <div class="staff-empty">
                    <h3>No Editors Found</h3>
                    <p>No editor accounts have been created yet.</p>
                </div>
            `;

            return;
        }

        data.forEach(editor => {

            const displayName = editor.username || "Unnamed Editor";

            const initials =
                displayName
                    .trim()
                    .split(/\s+/)
                    .map(word => word.charAt(0))
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();

            const card = document.createElement("div");
            card.className = "editor-card";

            card.innerHTML = `

                <div class="editor-avatar" style="display:flex;align-items:center;justify-content:center;font-weight:700;color:#aaa;">
                    ${escapeHTML(initials)}
                </div>

                <div class="editor-info">
                    <h3>${escapeHTML(displayName)}</h3>
                    <p>Editor</p>
                </div>

            `;

            container.appendChild(card);

        });

    } catch (error) {
        console.error("Unexpected editor directory error:", error);
    }

}
function displayHomepageDepartments() {

    const container =
        document.getElementById(
            "departmentList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (
        departmentDatabase.length === 0
    ) {

        container.innerHTML = `

            <div class="staff-empty">

                <h3>
                    No Departments Found
                </h3>

                <p>
                    No departments have been added yet.
                </p>

            </div>

        `;

        return;

    }


    departmentDatabase
        .forEach(
            department => {

                container.appendChild(
                    createDepartmentCard(
                        department
                    )
                );

            }
        );

}


/* =====================================================
   INDIVIDUAL DEPARTMENT PAGE
===================================================== */

async function displayIndividualDepartment() {

    const profile =
        document.getElementById(
            "departmentProfile"
        );


    if (!profile) {
        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const departmentId =
        params.get("id");


    const nameElement =
        document.getElementById(
            "departmentProfileName"
        );


    const descriptionElement =
        document.getElementById(
            "departmentProfileDescription"
        );


    const logoElement =
        document.getElementById(
            "departmentProfileLogo"
        );


    const headContainer =
        document.getElementById(
            "departmentHeadContainer"
        );


    const seniorContainer =
        document.getElementById(
            "departmentSeniorStaff"
        );


    if (!departmentId) {

        if (nameElement) {
            nameElement.textContent =
                "Department Not Found";
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                "No department was specified.";
        }

        return;

    }


    const department =
        departmentDatabase.find(
            item =>
                String(item.id) ===
                String(departmentId)
        );


    if (!department) {

        if (nameElement) {
            nameElement.textContent =
                "Department Not Found";
        }

        if (descriptionElement) {
            descriptionElement.textContent =
                "This department does not exist or has been removed.";
        }

        if (logoElement) {
            logoElement.textContent =
                "?";
        }

        return;

    }


    document.title =
        `${department.name} | RTS Staff Database`;


    if (nameElement) {

        nameElement.textContent =
            department.name;

    }


    if (descriptionElement) {

        descriptionElement.textContent =
            department.description ||
            "No description has been provided.";

    }


    /* =================================================
       LOGO
    ================================================== */

    if (logoElement) {

        const logo =
            getSafeLogoUrl(
                department.logoUrl
            );


        if (logo) {

            logoElement.innerHTML = `

                <img
                    src="${escapeHTML(logo)}"
                    alt="${escapeHTML(department.name)} Logo"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:contain;
                        border-radius:inherit;
                    "
                >

            `;

        }

        else {

            logoElement.textContent =
                department.name
                    .charAt(0)
                    .toUpperCase();

        }

    }


    /* =================================================
       HEAD
    ================================================== */

    if (headContainer) {

        const head =
            department.head?.trim();


        if (head) {

            const initials =
                head
                    .split(/\s+/)
                    .map(
                        word =>
                            word.charAt(0)
                    )
                    .join("")
                    .substring(0, 3)
                    .toUpperCase();


            headContainer.innerHTML = `

                <div class="profile-avatar">

                    ${escapeHTML(initials)}

                </div>


                <div>

                    <h3>

                        ${escapeHTML(head)}

                    </h3>


                    <p>

                        Head of ${escapeHTML(
                            department.name
                        )}

                    </p>

                </div>

            `;

        }

        else {

            headContainer.innerHTML = `

                <div class="profile-avatar">
                    ?
                </div>


                <div>

                    <h3>
                        No Head Assigned
                    </h3>


                    <p>
                        A department head has not been assigned.
                    </p>

                </div>

            `;

        }

    }


    /* =================================================
       SENIOR STAFF
    ================================================== */

    if (seniorContainer) {

        seniorContainer.innerHTML = "";


        const seniorStaff =
            department.seniorStaff
                ?.split(/\r?\n/)
                .map(
                    username =>
                        username.trim()
                )
                .filter(
                    username =>
                        username.length > 0
                )
                || [];


        if (
            seniorStaff.length === 0
        ) {

            seniorContainer.innerHTML = `

                <div class="staff-empty">

                    <h3>
                        No Senior Staff
                    </h3>

                    <p>
                        No senior staff members have been assigned.
                    </p>

                </div>

            `;

        }

        else {

            seniorStaff.forEach(
                username => {

                    const initials =
                        username
                            .split(/\s+/)
                            .map(
                                word =>
                                    word.charAt(0)
                            )
                            .join("")
                            .substring(0, 3)
                            .toUpperCase();


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "senior-card";


                    card.innerHTML = `

                        <div class="profile-avatar">

                            ${escapeHTML(initials)}

                        </div>


                        <h3>

                            ${escapeHTML(username)}

                        </h3>


                        <p>
                            Senior Staff
                        </p>

                    `;


                    seniorContainer.appendChild(
                        card
                    );

                }
            );

        }

    }

}


/* =====================================================
   DEPARTMENT QUICK MANAGEMENT
===================================================== */

function openDepartmentManagement() {

    const element =
        document.getElementById(
            "departmentManagementList"
        );


    if (element) {

        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;

    }


    alert(
        "Department management could not be found on this page."
    );

}


function openDepartmentHeads() {

    const element =
        document.getElementById(
            "departmentManagementList"
        );


    if (element) {

        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        alert(
            "Edit a department above to change its Department Head."
        );

        return;

    }


    alert(
        "Department management could not be found on this page."
    );

}


function openSeniorStaff() {

    const element =
        document.getElementById(
            "departmentManagementList"
        );


    if (element) {

        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });


        alert(
            "Edit a department above to change its Senior Staff."
        );

        return;

    }


    alert(
        "Department management could not be found on this page."
    );

}


/* =====================================================
   RANK MANAGEMENT
===================================================== */

function displayRankManagement() {

    const container = document.getElementById("rankManagementList");

    if (!container) return;

    container.innerHTML = "";

    if (rankDatabase.length === 0) {

        container.innerHTML = `
            <div class="management-empty">
                No ranks have been created.
            </div>
        `;

        return;
    }

    rankDatabase.forEach(rank => {

        const item = document.createElement("div");
        item.className = "management-item";

        const logo = getSafeLogoUrl(rank.logoUrl);

        item.innerHTML = `

            ${
                logo
                    ? `<img src="${escapeHTML(logo)}" alt="" style="width:32px; height:32px; object-fit:contain; border-radius:6px; margin-right:12px;">`
                    : ""
            }

            <span class="management-name">
                ${escapeHTML(rank.name)}
            </span>

            <div class="management-actions">

                <button class="management-button" onclick="editRank('${rank.id}')">
                    Edit
                </button>

                <button class="management-button delete" onclick="removeRank('${rank.id}')">
                    Remove
                </button>

            </div>

        `;

        container.appendChild(item);

    });

}


async function addRank() {

    const name = prompt("Enter the name of the new rank:");
    if (!name) return;

    const cleanName = name.trim();
    if (!cleanName) return;

    const exists = rankDatabase.some(
        rank => rank.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (exists) {
        alert("That rank already exists.");
        return;
    }

    const logoInput = prompt("Enter a logo image URL for this rank (optional, leave blank for none):");
    const cleanLogo = logoInput ? getSafeLogoUrl(logoInput.trim()) : "";

    if (logoInput && logoInput.trim() && !cleanLogo) {
        alert("That doesn't look like a valid image URL. The rank will be saved without a logo.");
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("ranks")
                .insert({ name: cleanName, logo_url: cleanLogo || null })
                .select()
                .single();

        if (error) {
            alert("Unable to add rank:\n\n" + error.message);
            return;
        }

        rankDatabase.push({ id: data.id, name: data.name, logoUrl: data.logo_url || "" });

        displayRankManagement();
        loadFilterOptions();
        populateStaffFormOptions();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while adding the rank.");
    }

}


async function editRank(id) {

    const rank = rankDatabase.find(item => String(item.id) === String(id));
    if (!rank) return;

    const newName = prompt("Enter the new rank name:", rank.name);
    if (!newName) return;

    const cleanName = newName.trim();
    if (!cleanName) return;

    const logoInput = prompt(
        "Enter a logo image URL for this rank (leave blank to remove, cancel to keep unchanged):",
        rank.logoUrl || ""
    );

    let logoToSave = rank.logoUrl || "";

    if (logoInput !== null) {

        const cleanLogo = logoInput.trim() ? getSafeLogoUrl(logoInput.trim()) : "";

        if (logoInput.trim() && !cleanLogo) {
            alert("That doesn't look like a valid image URL. Keeping the previous logo.");
        } else {
            logoToSave = cleanLogo;
        }

    }

    try {

        const { data, error } =
            await supabaseClient
                .from("ranks")
                .update({ name: cleanName, logo_url: logoToSave || null })
                .eq("id", id)
                .select()
                .single();

        if (error) {
            alert("Unable to update rank:\n\n" + error.message);
            return;
        }

        rank.name = data.name;
        rank.logoUrl = data.logo_url || "";

        displayRankManagement();
        loadFilterOptions();
        populateStaffFormOptions();
        displayStaff();
        displayEditorStaff();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while updating the rank.");
    }

}


async function removeRank(id) {

    const rank = rankDatabase.find(item => String(item.id) === String(id));
    if (!rank) return;

    const confirmed = confirm(`Are you sure you want to remove "${rank.name}"?`);
    if (!confirmed) return;

    try {

        const { error } =
            await supabaseClient
                .from("ranks")
                .delete()
                .eq("id", id);

        if (error) {
            alert("Unable to delete rank:\n\n" + error.message);
            return;
        }

        rankDatabase = rankDatabase.filter(item => String(item.id) !== String(id));

        displayRankManagement();
        loadFilterOptions();
        populateStaffFormOptions();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while removing the rank.");
    }

}


/* =====================================================
   STATUS MANAGEMENT
===================================================== */

function displayStatusManagement() {

    const container = document.getElementById("statusManagementList");

    if (!container) return;

    container.innerHTML = "";

    if (statusDatabase.length === 0) {

        container.innerHTML = `
            <div class="management-empty">
                No statuses have been created.
            </div>
        `;

        return;
    }

    statusDatabase.forEach(status => {

        const item = document.createElement("div");
        item.className = "management-item";

        item.innerHTML = `

            <div class="management-status-row">

                <input
                    type="color"
                    class="status-color-input"
                    value="${escapeHTML(status.color)}"
                    onchange="updateStatusColor('${status.id}', this.value)"
                >

                <span class="management-name">
                    ${escapeHTML(status.name)}
                </span>

            </div>

            <div class="management-actions">

                <button class="management-button" onclick="editStatus('${status.id}')">
                    Edit
                </button>

                <button class="management-button delete" onclick="removeStatus('${status.id}')">
                    Remove
                </button>

            </div>

        `;

        container.appendChild(item);

    });

}


async function addStatus() {

    const name = prompt("Enter the name of the new status:");
    if (!name) return;

    const cleanName = name.trim();
    if (!cleanName) return;

    const exists = statusDatabase.some(
        status => status.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (exists) {
        alert("That status already exists.");
        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("statuses")
                .insert({ name: cleanName, color: "#5865f2" })
                .select()
                .single();

        if (error) {
            alert("Unable to add status:\n\n" + error.message);
            return;
        }

        statusDatabase.push({ id: data.id, name: data.name, color: data.color });

        displayStatusManagement();
        loadFilterOptions();
        populateStaffFormOptions();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while adding the status.");
    }

}


async function editStatus(id) {

    const status = statusDatabase.find(item => String(item.id) === String(id));
    if (!status) return;

    const newName = prompt("Enter the new status name:", status.name);
    if (!newName) return;

    const cleanName = newName.trim();
    if (!cleanName) return;

    try {

        const { data, error } =
            await supabaseClient
                .from("statuses")
                .update({ name: cleanName })
                .eq("id", id)
                .single();

        if (error) {
            alert("Unable to update status:\n\n" + error.message);
            return;
        }

        status.name = data.name;

        displayStatusManagement();
        loadFilterOptions();
        populateStaffFormOptions();
        displayStaff();
        displayEditorStaff();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while updating the status.");
    }

}


async function updateStatusColor(id, color) {

    try {

        const { error } =
            await supabaseClient
                .from("statuses")
                .update({ color: color })
                .eq("id", id);

        if (error) {
            alert("Unable to update color:\n\n" + error.message);
            return;
        }

        const status = statusDatabase.find(item => String(item.id) === String(id));
        if (status) status.color = color;

        displayStaff();
        displayEditorStaff();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while updating the color.");
    }

}


async function removeStatus(id) {

    const status = statusDatabase.find(item => String(item.id) === String(id));
    if (!status) return;

    const confirmed = confirm(`Are you sure you want to remove "${status.name}"?`);
    if (!confirmed) return;

    try {

        const { error } =
            await supabaseClient
                .from("statuses")
                .delete()
                .eq("id", id);

        if (error) {
            alert("Unable to delete status:\n\n" + error.message);
            return;
        }

        statusDatabase = statusDatabase.filter(item => String(item.id) !== String(id));

        displayStatusManagement();
        loadFilterOptions();
        populateStaffFormOptions();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while removing the status.");
    }

}

/* =====================================================
   EDITOR MANAGEMENT
===================================================== */

async function createEditorAccount(event) {

    event.preventDefault();

    const email =
        document.getElementById(
            "newEditorEmail"
        )?.value
        ?.trim();

    const password =
        document.getElementById(
            "newEditorPassword"
        )?.value;

    const name =
        document.getElementById(
            "newEditorName"
        )?.value
        ?.trim();

    const message =
        document.getElementById(
            "createEditorMessage"
        );

    const button =
        document.querySelector(
            "#createEditorForm button[type='submit']"
        );


    if (message) {
        message.textContent = "";
    }


    if (!email || !password) {

        if (message) {
            message.textContent =
                "Please enter an email and password.";
        }

        return;

    }


    if (password.length < 6) {

        if (message) {
            message.textContent =
                "Password must be at least 6 characters.";
        }

        return;

    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Creating...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.functions.invoke(
                "create-editor",
                {
                    body: {
                        email:
                            email,

                        password:
                            password,

                        name:
                            name || null
                    }
                }
            );


        if (error) {

            console.error(
                "Create editor error:",
                error
            );

            if (message) {
                message.textContent =
                    error.message ||
                    "Unable to create editor.";
            }

            return;

        }


        if (
            data &&
            data.error
        ) {

            if (message) {
                message.textContent =
                    data.error;
            }

            return;

        }


        if (message) {

            message.textContent =
                "Editor account created successfully.";

        }


        document
            .getElementById(
                "createEditorForm"
            )
            ?.reset();


        await loadEditorAccounts();

    }

    catch (error) {

        console.error(
            "Unexpected editor creation error:",
            error
        );

        if (message) {

            message.textContent =
                "An unexpected error occurred.";

        }

    }

    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Create Editor";

        }

    }

}


/* =====================================================
   LOAD EDITOR ACCOUNTS
===================================================== */

async function loadEditorAccounts() {

    const container =
        document.getElementById(
            "editorManagementList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="management-empty">

            Loading editors...

        </div>

    `;


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("editors")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "Editor loading error:",
                error
            );


            container.innerHTML = `

                <div class="management-empty">

                    Unable to load editors.

                </div>

            `;

            return;

        }


        container.innerHTML = "";


        if (
            !data ||
            data.length === 0
        ) {

            container.innerHTML = `

                <div class="management-empty">

                    No editors have been created.

                </div>

            `;

            return;

        }


        data.forEach(
            editor => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "management-item";


                item.innerHTML = `

                    <div>

                        <span class="management-name">

                            ${escapeHTML(
                                editor.name ||
                                editor.email ||
                                "Unnamed Editor"
                            )}

                        </span>


                        <small>

                            ${escapeHTML(
                                editor.email ||
                                ""
                            )}

                        </small>

                    </div>


                    <div class="management-actions">

                        <button
                            class="management-button delete"
                            onclick="deleteEditor('${editor.id}')"
                        >
                            Remove
                        </button>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Unexpected editor loading error:",
            error
        );

    }

}


/* =====================================================
   DELETE EDITOR
===================================================== */

async function deleteEditor(userId) {

    if (!userId) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to remove this editor? They will no longer be able to access the Editor Panel."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.functions.invoke(
                "create-editor",
                {
                    method: "DELETE",

                    body: {
                        userId:
                            userId
                    }
                }
            );


        if (error) {

            console.error(
                "Delete editor error:",
                error
            );

            alert(
                error.message ||
                "Unable to remove editor."
            );

            return;

        }


        if (
            data &&
            data.error
        ) {

            alert(
                data.error
            );

            return;

        }


        alert(
            "Editor removed successfully."
        );


        await loadEditorAccounts();

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "An unexpected error occurred while removing the editor."
        );

    }

}
/* =====================================================
   ADMIN SESSION
===================================================== */

function showAdminPanel() {

    const login =
        document.getElementById(
            "adminLogin"
        );

    const panel =
        document.getElementById(
            "adminPanel"
        );


    if (!login || !panel) {
        return;
    }


    login.classList.add("hidden");

    panel.classList.remove("hidden");
    loadEditorAccounts();
}


/* =====================================================
   ADMIN LOGIN
===================================================== */

function setupAdminLogin() {

    const adminLoginForm =
        document.getElementById(
            "adminLoginForm"
        );


    if (!adminLoginForm) {
        return;
    }


    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const password =
                document.getElementById(
                    "adminPassword"
                )?.value;


            const error =
                document.getElementById(
                    "adminLoginError"
                );


            if (error) {
                error.textContent = "";
            }


            if (!password) {

                if (error) {
                    error.textContent =
                        "Please enter your administrator password.";
                }

                return;

            }


            const button =
                adminLoginForm.querySelector(
                    "button[type='submit']"
                );


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Signing In...";

            }


            try {

                /*
                 * The administrator email is
                 * the email configured in the
                 * create-editor Edge Function.
                 */

                const ADMIN_EMAIL =
                    "devmccollins@gmail.com";


                const {
                    data,
                    error: loginError
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email:
                                ADMIN_EMAIL,

                            password:
                                password

                        });


                if (loginError) {

                    if (error) {
                        error.textContent =
                            loginError.message ||
                            "Incorrect administrator password.";
                    }

                    return;

                }


                if (!data?.session) {

                    if (error) {
                        error.textContent =
                            "Login failed. No authentication session was created.";
                    }

                    return;

                }


                showAdminPanel();

            }

            catch (loginException) {

                console.error(
                    "Admin login error:",
                    loginException
                );


                if (error) {

                    error.textContent =
                        "Unable to connect to Supabase.";

                }

            }

            finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Sign In";

                }

            }

        }
    );

}


/* =====================================================
   ADMIN LOGOUT
===================================================== */

async function adminLogout() {

    try {

        await supabaseClient.auth.signOut();

    }

    catch (error) {

        console.error(
            "Admin logout error:",
            error
        );

    }


    location.reload();

}


/* =====================================================
   CHECK ADMIN SESSION
===================================================== */

async function checkAdminSession() {

    const login =
        document.getElementById(
            "adminLogin"
        );

    const panel =
        document.getElementById(
            "adminPanel"
        );


    if (!login || !panel) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .getSession();


        if (error) {

            console.error(
                "Unable to check admin session:",
                error
            );

            showAdminLogin();

            return;

        }


        const session =
            data?.session;


        if (!session) {

            showAdminLogin();

            return;

        }


        /*
         * Make sure this session belongs
         * to the administrator.
         */

        const ADMIN_EMAIL =
            "devmccollins@gmail.com";


        if (
            session.user.email?.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            await supabaseClient.auth.signOut();

            showAdminLogin();

            return;

        }


        showAdminPanel();

    }

    catch (error) {

        console.error(
            "Admin authentication error:",
            error
        );

        showAdminLogin();

    }

}


/* =====================================================
   SHOW ADMIN LOGIN
===================================================== */

function showAdminLogin() {

    const login =
        document.getElementById(
            "adminLogin"
        );

    const panel =
        document.getElementById(
            "adminPanel"
        );


    if (!login || !panel) {
        return;
    }


    panel.classList.add("hidden");

    login.classList.remove("hidden");

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function setupEventListeners() {
    const createEditorForm =
        document.getElementById(
            "createEditorForm"
        );


    if (createEditorForm) {

        createEditorForm.addEventListener(
            "submit",
            createEditorAccount
        );

    }
    const logoInput =
        document.getElementById(
            "departmentLogo"
        );


    if (logoInput) {

        logoInput.addEventListener(
            "input",
            updateDepartmentLogoPreview
        );

        logoInput.addEventListener(
            "change",
            updateDepartmentLogoPreview
        );

    }


    const avatarInput =
        document.getElementById("staffAvatarUrl");

    if (avatarInput) {

        avatarInput.addEventListener("input", updateStaffAvatarPreview);
        avatarInput.addEventListener("change", updateStaffAvatarPreview);

    }


    const startDateInput =
        document.getElementById(
            "staffStartDate"
        );


    const endDateInput =
        document.getElementById(
            "staffEndDate"
        );


    if (startDateInput) {

        startDateInput.addEventListener(
            "change",
            updateServicePreview
        );

    }


    if (endDateInput) {

        endDateInput.addEventListener(
            "change",
            updateServicePreview
        );

    }


    const editorSearch =
        document.getElementById(
            "editorStaffSearch"
        );


    if (editorSearch) {

        editorSearch.addEventListener(
            "input",
            displayEditorStaff
        );

    }

}
/* =====================================================
   EDITOR MANAGEMENT
===================================================== */

async function loadEditorManagement() {

    const container =
        document.getElementById(
            "editorManagementList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="management-empty">
            Loading editors...
        </div>
    `;

    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();

        if (!user) {
            container.innerHTML = `
                <div class="management-empty">
                    You must be signed in as an administrator.
                </div>
            `;
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient
                .from("editors")
                .select("id, email, created_at")
                .order(
                    "created_at",
                    {
                        ascending: true
                    }
                );

        if (error) {
            console.error(
                "Unable to load editors:",
                error
            );

            container.innerHTML = `
                <div class="management-empty">
                    Unable to load editors.
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        if (!data || data.length === 0) {

            container.innerHTML = `
                <div class="management-empty">
                    No editors have been created yet.
                </div>
            `;

            return;
        }

        data.forEach(editor => {

            const item =
                document.createElement("div");

            item.className =
                "management-item";

            const date =
                editor.created_at
                    ? new Date(
                        editor.created_at
                    ).toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        }
                    )
                    : "Unknown";

            item.innerHTML = `

                <div>

                    <span class="management-name">
                        ${escapeHTML(editor.email)}
                    </span>

                    <small>
                        Created ${escapeHTML(date)}
                    </small>

                </div>

                <div class="management-actions">

                    <button
                        class="management-button delete"
                        onclick="removeEditor('${editor.id}', '${escapeHTML(editor.email)}')"
                    >
                        Remove
                    </button>

                </div>

            `;

            container.appendChild(item);

        });

    }

    catch (error) {

        console.error(
            "Unexpected editor loading error:",
            error
        );

        container.innerHTML = `
            <div class="management-empty">
                An unexpected error occurred.
            </div>
        `;

    }

}


/* =====================================================
   OPEN CREATE EDITOR MODAL
===================================================== */

function openCreateEditorModal() {

    const modal =
        document.getElementById(
            "createEditorModal"
        );

    const form =
        document.getElementById(
            "createEditorForm"
        );

    const error =
        document.getElementById(
            "createEditorError"
        );

    if (!modal) {
        return;
    }

    if (form) {
        form.reset();
    }

    if (error) {
        error.textContent = "";
    }

    modal.classList.remove("hidden");

}


/* =====================================================
   CLOSE CREATE EDITOR MODAL
===================================================== */

function closeCreateEditorModal() {

    const modal =
        document.getElementById(
            "createEditorModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

}


/* =====================================================
   CREATE EDITOR
===================================================== */

async function createEditorAccount(
    email,
    password
) {

    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();

    if (!session) {

        throw new Error(
            "You are not currently signed in."
        );

    }


    const response =
        await fetch(
            `${SUPABASE_URL}/functions/v1/create-editor`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${session.access_token}`

                },

                body: JSON.stringify({

                    email:
                        email,

                    password:
                        password

                })

            }
        );


    let result = {};

    try {
        result =
            await response.json();
    }

    catch {
        result = {};
    }


    if (!response.ok) {

        throw new Error(
            result.error ||
            result.message ||
            "Unable to create editor."
        );

    }


    return result;

}


/* =====================================================
   CREATE EDITOR FORM
===================================================== */

function setupCreateEditorForm() {

    const form =
        document.getElementById(
            "createEditorForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "newEditorEmail"
                )?.value
                ?.trim();


            const password =
                document.getElementById(
                    "newEditorPassword"
                )?.value;


            const error =
                document.getElementById(
                    "createEditorError"
                );


            const button =
                form.querySelector(
                    "button[type='submit']"
                );


            if (error) {
                error.textContent = "";
            }


            if (!email || !password) {

                if (error) {
                    error.textContent =
                        "Please enter an email and password.";
                }

                return;

            }


            if (password.length < 6) {

                if (error) {
                    error.textContent =
                        "Password must be at least 6 characters.";
                }

                return;

            }


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Creating...";

            }


            try {

                await createEditorAccount(
                    email,
                    password
                );


                closeCreateEditorModal();

                await loadEditorManagement();


                alert(
                    `Editor account created successfully for ${email}.`
                );

            }

            catch (error) {

                console.error(
                    "Create editor error:",
                    error
                );

                if (error) {

                    document.getElementById(
                        "createEditorError"
                    ).textContent =
                        error.message ||
                        "Unable to create editor.";

                }

            }

            finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Create Editor";

                }

            }

        }
    );

}


/* =====================================================
   REMOVE EDITOR
===================================================== */

async function removeEditor(
    editorId,
    email
) {

    const confirmed =
        confirm(
            `Are you sure you want to remove ${email} from the Editor Panel?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth.getSession();


        if (!session) {

            alert(
                "You must be signed in."
            );

            return;

        }


        const response =
            await fetch(
                `${SUPABASE_URL}/functions/v1/create-editor`,
                {

                    method: "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${session.access_token}`

                    },

                    body: JSON.stringify({

                        userId:
                            editorId

                    })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Unable to remove editor."
            );

        }


        await loadEditorManagement();


        alert(
            `${email} has been removed from the Editor Panel.`
        );

    }

    catch (error) {

        console.error(
            "Remove editor error:",
            error
        );

        alert(
            error.message ||
            "Unable to remove editor."
        );

    }

}


/* =====================================================
   OPEN EDITOR MANAGEMENT
===================================================== */

function openEditorManagement() {

    const element =
        document.getElementById(
            "editorManagementList"
        );

    if (!element) {

        alert(
            "Editor management could not be found."
        );

        return;

    }


    element.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    loadEditorManagement();

}
/* =====================================================
   EDITOR MANAGEMENT
===================================================== */

const CREATE_EDITOR_FUNCTION =
    `${SUPABASE_URL}/functions/v1/create-editor`;


/* =====================================================
   SHOW / HIDE CREATION FORM
===================================================== */

function openEditorCreationForm() {

    const form =
        document.getElementById(
            "editorCreationForm"
        );

    if (!form) {
        return;
    }

    form.classList.remove("hidden");

    document.getElementById(
        "newEditorEmail"
    )?.focus();

}


function closeEditorCreationForm() {

    const form =
        document.getElementById(
            "editorCreationForm"
        );

    if (!form) {
        return;
    }

    form.classList.add("hidden");

    const editorForm =
        document.getElementById(
            "createEditorForm"
        );

    if (editorForm) {
        editorForm.reset();
    }

    const message =
        document.getElementById(
            "createEditorMessage"
        );

    if (message) {
        message.textContent = "";
    }

}


/* =====================================================
   LOAD EDITORS
===================================================== */

async function loadEditorManagement() {

    const container =
        document.getElementById(
            "editorManagementList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="management-empty">
            Loading editors...
        </div>
    `;

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("editors")
                .select("id, email")
                .order(
                    "email",
                    {
                        ascending: true
                    }
                );

        if (error) {

            console.error(
                "Editor loading error:",
                error
            );

            container.innerHTML = `
                <div class="management-empty">
                    Unable to load editors.
                </div>
            `;

            return;
        }

        displayEditorManagement(
            data || []
        );

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="management-empty">
                Unable to load editors.
            </div>
        `;

    }

}


/* =====================================================
   DISPLAY EDITORS
===================================================== */

let editorManagementDatabase = [];


function displayEditorManagement(
    editors
) {

    const container =
        document.getElementById(
            "editorManagementList"
        );

    if (!container) {
        return;
    }

    editorManagementDatabase =
        editors || [];

    const search =
        document.getElementById(
            "editorManagementSearch"
        )?.value
        ?.trim()
        .toLowerCase()
        || "";


    const filtered =
        editorManagementDatabase.filter(
            editor =>
                (editor.email || "")
                    .toLowerCase()
                    .includes(search)
        );


    container.innerHTML = "";


    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="management-empty">
                No editors found.
            </div>
        `;

        return;

    }


    filtered.forEach(
        editor => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "management-item";


            item.innerHTML = `

                <div>

                    <span class="management-name">
                        ${escapeHTML(
                            editor.email
                        )}
                    </span>

                    <div
                        style="
                            font-size:13px;
                            opacity:.6;
                            margin-top:4px;
                        "
                    >
                        Editor Account
                    </div>

                </div>


                <div class="management-actions">

                    <button
                        class="management-button delete"
                        onclick="removeEditor('${editor.id}')"
                    >
                        Remove
                    </button>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


/* =====================================================
   CREATE EDITOR
===================================================== */

function setupEditorManagement() {

    const form =
        document.getElementById(
            "createEditorForm"
        );

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "newEditorEmail"
                )?.value
                ?.trim();


            const password =
                document.getElementById(
                    "newEditorPassword"
                )?.value;


            const message =
                document.getElementById(
                    "createEditorMessage"
                );


            const button =
                form.querySelector(
                    "button[type='submit']"
                );


            if (message) {
                message.textContent = "";
            }


            if (!email || !password) {
                return;
            }


            if (button) {

                button.disabled = true;

                button.textContent =
                    "Creating...";

            }


            try {

                const {
                    data: {
                        session
                    }
                } =
                    await supabaseClient.auth
                        .getSession();


                if (!session) {

                    if (message) {
                        message.textContent =
                            "Your admin session has expired.";
                    }

                    return;

                }


                const response =
                    await fetch(
                        CREATE_EDITOR_FUNCTION,
                        {
                            method: "POST",

                            headers: {

                                "Authorization":
                                    `Bearer ${session.access_token}`,

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    email:
                                        email,

                                    password:
                                        password
                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    if (message) {
                        message.textContent =
                            result.error ||
                            "Unable to create editor.";
                    }

                    return;

                }


                if (message) {

                    message.textContent =
                        "Editor created successfully.";

                }


                closeEditorCreationForm();

                await loadEditorManagement();

            }

            catch (error) {

                console.error(error);

                if (message) {
                    message.textContent =
                        "Unable to connect to the server.";
                }

            }

            finally {

                if (button) {

                    button.disabled = false;

                    button.textContent =
                        "Create Editor";

                }

            }

        }
    );


    const search =
        document.getElementById(
            "editorManagementSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            function() {

                displayEditorManagement(
                    editorManagementDatabase
                );

            }
        );

    }

}


/* =====================================================
   REMOVE EDITOR
===================================================== */

async function removeEditor(
    userId
) {

    if (!userId) {
        return;
    }


    const editor =
        editorManagementDatabase.find(
            item =>
                String(item.id) ===
                String(userId)
        );


    if (!editor) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to remove ${editor.email} as an editor?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth
                .getSession();


        if (!session) {

            alert(
                "Your admin session has expired."
            );

            return;

        }


        const response =
            await fetch(
                CREATE_EDITOR_FUNCTION,
                {
                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${session.access_token}`,

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({
                            userId:
                                userId
                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Unable to remove editor."
            );

            return;

        }


        await loadEditorManagement();

    }

    catch (error) {

        console.error(error);

        alert(
            "Unable to connect to the server."
        );

    }

}
/* =====================================================
   INITIALIZE WEBSITE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {
        displayHomepageEditors();
        
        setupEditorLogin();

        setupStaffForm();

        setupDepartmentForm();

        setupEventListeners();
        const adminForgotPassword =
    document.getElementById("adminForgotPassword");

if (adminForgotPassword) {

    adminForgotPassword.addEventListener(
        "click",
        async function () {

            const error =
                await sendPasswordReset(ADMIN_EMAIL);

            const message =
                document.getElementById("adminLoginError");

            if (message) {

                message.style.color = error ? "" : "green";

                message.textContent =
                    error
                        ? (error.message || "Unable to send reset email.")
                        : "Password reset email sent. Check your inbox.";

            }

        }
    );

}


const editorForgotPassword =
    document.getElementById("editorForgotPassword");

if (editorForgotPassword) {

    editorForgotPassword.addEventListener(
        "click",
        async function () {

            const email =
                document.getElementById("editorEmail")?.value?.trim();

            const message =
                document.getElementById("editorLoginError");

            if (!email) {

                if (message) {
                    message.textContent =
                        "Enter your email above first, then click Forgot Password.";
                }

                return;

            }

            const error =
                await sendPasswordReset(email);

            if (message) {

                message.style.color = error ? "" : "green";

                message.textContent =
                    error
                        ? (error.message || "Unable to send reset email.")
                        : "Password reset email sent. Check your inbox.";

            }

        }
    );

}

        console.log(
            "Departments loaded:",
            departmentDatabase
        );
        
        console.log(
            "Department count:",
            departmentDatabase.length
        );


        /* =============================================
           LOAD DEPARTMENTS
        ============================================== */

        await loadDepartmentDatabase();

        await loadStatusDatabase();

        await loadRankDatabase();

        await loadStaffDatabase();

        await loadSpotlightDatabase();


        /* =============================================
           HOMEPAGE
        ============================================== */

        displayHomepageDepartments();

        displayHomepageSpotlights();


        /* =============================================
           DEPARTMENTS PAGE
        ============================================== */

        displayDepartmentPage();


        /* =============================================
           INDIVIDUAL DEPARTMENT PAGE
        ============================================== */

        await displayIndividualDepartment();


        /* =============================================
           STAFF PAGE
        ============================================== */

        await initializeStaffPage();


        /* =============================================
           EDITOR
        ============================================== */

        await checkEditorSession();


       /* =============================================
          ADMIN
        ============================================== */

        setupAdminLogin();

        await checkAdminSession();
        loadEditorManagement();


        /* =============================================
           CONFIGURATION
        ============================================== */

        displayRankManagement();

        displayStatusManagement();

        displayDepartmentManagement();
        loadEditorManagement();

    }
);

/* =====================================================
   STAFF SPOTLIGHTS
===================================================== */

let spotlightDatabase = { month: [], week: [] };

async function loadSpotlightDatabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("spotlights")
                .select("id, type, staff_id")
                .eq("active", true)
                .order("created_at", { ascending: true });

        if (error) {
            console.error("Spotlight loading error:", error);
            spotlightDatabase = { month: [], week: [] };
            return;
        }

        spotlightDatabase = { month: [], week: [] };

        (data || []).forEach(row => {
            if (spotlightDatabase[row.type]) {
                spotlightDatabase[row.type].push({
                    id: row.id,
                    staffId: row.staff_id
                });
            }
        });

    } catch (error) {
        console.error("Unexpected spotlight error:", error);
        spotlightDatabase = { month: [], week: [] };
    }

}


function createSpotlightPersonCard(staffId) {

    const member = staffDatabase.find(
        item => String(item.id) === String(staffId)
    );

    if (!member) return "";

    const initials =
        member.username
            .trim()
            .split(/\s+/)
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

    const avatar = getSafeLogoUrl(member.avatarUrl);

    return `

        <div class="spotlight-person">

            <div class="spotlight-avatar">
                ${
                    avatar
                        ? `<img src="${escapeHTML(avatar)}" alt="" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;">`
                        : escapeHTML(initials)
                }
            </div>

            <h4>${escapeHTML(member.username)}</h4>

            <p>${escapeHTML(member.rank)}</p>

        </div>

    `;

}


function displayHomepageSpotlights() {

    const monthContainer = document.getElementById("staffOfMonth");
    const weekContainer = document.getElementById("staffOfWeek");

    if (monthContainer) {

        if (spotlightDatabase.month.length === 0) {

            monthContainer.innerHTML = `
                <div class="staff-empty">
                    <p>No one has been selected yet.</p>
                </div>
            `;

        } else {

            monthContainer.innerHTML =
                spotlightDatabase.month
                    .map(entry => createSpotlightPersonCard(entry.staffId))
                    .join("");

        }

    }

    if (weekContainer) {

        if (spotlightDatabase.week.length === 0) {

            weekContainer.innerHTML = `
                <div class="staff-empty">
                    <p>No one has been selected yet.</p>
                </div>
            `;

        } else {

            weekContainer.innerHTML =
                spotlightDatabase.week
                    .map(entry => createSpotlightPersonCard(entry.staffId))
                    .join("");

        }

    }

}


function populateSpotlightAddSelects() {

    ["month", "week"].forEach(type => {

        const select = document.getElementById(`spotlight${type === "month" ? "Month" : "Week"}AddSelect`);

        if (!select) return;

        const alreadyAdded = spotlightDatabase[type].map(entry => String(entry.staffId));

        select.innerHTML = `<option value="">-- Select staff member --</option>`;

        staffDatabase
            .filter(member => !alreadyAdded.includes(String(member.id)))
            .forEach(member => {

                const option = document.createElement("option");
                option.value = member.id;
                option.textContent = member.username;
                select.appendChild(option);

            });

    });

}


function displaySpotlightManagement(type) {

    const container = document.getElementById(
        type === "month" ? "spotlightMonthList" : "spotlightWeekList"
    );

    if (!container) return;

    container.innerHTML = "";

    if (spotlightDatabase[type].length === 0) {

        container.innerHTML = `
            <div class="management-empty">
                No one has been added yet.
            </div>
        `;

        return;
    }

    spotlightDatabase[type].forEach(entry => {

        const member = staffDatabase.find(
            item => String(item.id) === String(entry.staffId)
        );

        const item = document.createElement("div");
        item.className = "management-item";

        item.innerHTML = `

            <span class="management-name">
                ${escapeHTML(member ? member.username : "Unknown Staff Member")}
            </span>

            <div class="management-actions">

                <button
                    class="management-button delete"
                    onclick="removeSpotlightMember('${entry.id}', '${type}')"
                >
                    Remove
                </button>

            </div>

        `;

        container.appendChild(item);

    });

}


function refreshSpotlightUI() {

    displaySpotlightManagement("month");
    displaySpotlightManagement("week");
    populateSpotlightAddSelects();

}


async function addSpotlightMember(type) {

    const select = document.getElementById(
        type === "month" ? "spotlightMonthAddSelect" : "spotlightWeekAddSelect"
    );

    const staffId = select?.value;

    if (!staffId) {
        alert("Please select a staff member first.");
        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("spotlights")
                .insert({ type: type, staff_id: staffId })
                .select()
                .single();

        if (error) {
            alert("Unable to add spotlight:\n\n" + error.message);
            return;
        }

        spotlightDatabase[type].push({ id: data.id, staffId: data.staff_id });

        refreshSpotlightUI();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while adding the spotlight.");
    }

}


async function removeSpotlightMember(id, type) {

    try {

        const { error } =
            await supabaseClient
                .from("spotlights")
                .update({ active: false })
                .eq("id", id);

        if (error) {
            alert("Unable to remove spotlight:\n\n" + error.message);
            return;
        }

        spotlightDatabase[type] =
            spotlightDatabase[type].filter(entry => String(entry.id) !== String(id));

        refreshSpotlightUI();

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while removing the spotlight.");
    }

}


/* =====================================================
   SPOTLIGHT LIFETIME COUNTS (for Employee File)
===================================================== */

let spotlightCounts = { month: {}, week: {} };

async function loadSpotlightCounts() {

    try {

        const { data, error } =
            await supabaseClient
                .from("spotlights")
                .select("type, staff_id");

        if (error) {
            console.error("Spotlight count loading error:", error);
            spotlightCounts = { month: {}, week: {} };
            return;
        }

        spotlightCounts = { month: {}, week: {} };

        (data || []).forEach(row => {

            if (!spotlightCounts[row.type]) return;

            const key = String(row.staff_id);

            spotlightCounts[row.type][key] =
                (spotlightCounts[row.type][key] || 0) + 1;

        });

    } catch (error) {
        console.error("Unexpected spotlight count error:", error);
        spotlightCounts = { month: {}, week: {} };
    }

}


/* =====================================================
   STAFF DEPARTMENT HISTORY
===================================================== */

let departmentHistoryDatabase = [];

async function loadDepartmentHistoryDatabase() {

    try {

        const { data, error } =
            await supabaseClient
                .from("staff_department_history")
                .select("*")
                .order("start_date", { ascending: false });

        if (error) {
            console.error("Department history loading error:", error);
            departmentHistoryDatabase = [];
            return [];
        }

        departmentHistoryDatabase = (data || []).map(entry => ({
            id: entry.id,
            staffId: entry.staff_id,
            department: entry.department || "",
            rank: entry.rank || "",
            status: entry.status || "",
            startDate: entry.start_date || "",
            endDate: entry.end_date || ""
        }));

        return departmentHistoryDatabase;

    } catch (error) {
        console.error("Unexpected department history error:", error);
        departmentHistoryDatabase = [];
        return [];
    }

}


function populateHistoryFormOptions() {

    const departmentSelect = document.getElementById("historyDepartment");
    const rankSelect = document.getElementById("historyRank");
    const statusSelect = document.getElementById("historyStatus");

    if (departmentSelect) {

        departmentSelect.innerHTML = "";

        departmentDatabase.forEach(department => {
            const option = document.createElement("option");
            option.value = department.name;
            option.textContent = department.name;
            departmentSelect.appendChild(option);
        });

    }

    if (rankSelect) {

        rankSelect.innerHTML = "";

        rankDatabase.forEach(rank => {
            const option = document.createElement("option");
            option.value = rank.name;
            option.textContent = rank.name;
            rankSelect.appendChild(option);
        });

    }

    if (statusSelect) {

        statusSelect.innerHTML = "";

        statusDatabase.forEach(status => {
            const option = document.createElement("option");
            option.value = status.name;
            option.textContent = status.name;
            statusSelect.appendChild(option);
        });

    }

}


function displayStaffHistoryManagement(staffId) {

    const container = document.getElementById("staffHistoryList");

    if (!container) return;

    const entries = departmentHistoryDatabase.filter(
        entry => String(entry.staffId) === String(staffId)
    );

    container.innerHTML = "";

    if (entries.length === 0) {

        container.innerHTML = `
            <div class="management-empty">
                No past departments added yet.
            </div>
        `;

        return;
    }

    entries.forEach(entry => {

        const item = document.createElement("div");
        item.className = "management-item";

        const days = calculateServiceDays(entry.startDate, entry.endDate);

        item.innerHTML = `

            <div>

                <span class="management-name">
                    ${escapeHTML(entry.department)}
                </span>

                <small style="display:block; color:#858b98; margin-top:3px;">
                    ${escapeHTML(entry.rank || "")}${entry.rank && entry.status ? " · " : ""}${escapeHTML(entry.status || "")}${(entry.rank || entry.status) ? " · " : ""}${days} Days
                </small>

            </div>

            <div class="management-actions">

                <button
                    class="management-button delete"
                    onclick="removeDepartmentHistoryEntry('${entry.id}', '${staffId}')"
                >
                    Remove
                </button>

            </div>

        `;

        container.appendChild(item);

    });

}


async function addDepartmentHistoryEntry() {

    if (editingStaffId === null) {
        alert("Save this staff member first before adding department history.");
        return;
    }

    const department = document.getElementById("historyDepartment")?.value;
    const rank = document.getElementById("historyRank")?.value;
    const status = document.getElementById("historyStatus")?.value;
    const startDate = document.getElementById("historyStartDate")?.value;
    const endDate = document.getElementById("historyEndDate")?.value;

    if (!department) {
        alert("Please select a department.");
        return;
    }

    if (!startDate) {
        alert("Please enter a start date.");
        return;
    }

    if (endDate && endDate < startDate) {
        alert("The end date cannot be before the start date.");
        return;
    }

    try {

        const { data, error } =
            await supabaseClient
                .from("staff_department_history")
                .insert({
                    staff_id: editingStaffId,
                    department: department,
                    rank: rank || null,
                    status: status || null,
                    start_date: startDate,
                    end_date: endDate || null
                })
                .select()
                .single();

        if (error) {
            alert("Unable to add past department:\n\n" + error.message);
            return;
        }

        departmentHistoryDatabase.push({
            id: data.id,
            staffId: data.staff_id,
            department: data.department,
            rank: data.rank || "",
            status: data.status || "",
            startDate: data.start_date || "",
            endDate: data.end_date || ""
        });

        displayStaffHistoryManagement(editingStaffId);

        document.getElementById("historyStartDate").value = "";
        document.getElementById("historyEndDate").value = "";

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while adding the past department.");
    }

}


async function removeDepartmentHistoryEntry(id, staffId) {

    const confirmed = confirm("Remove this past department entry?");
    if (!confirmed) return;

    try {

        const { error } =
            await supabaseClient
                .from("staff_department_history")
                .delete()
                .eq("id", id);

        if (error) {
            alert("Unable to remove entry:\n\n" + error.message);
            return;
        }

        departmentHistoryDatabase =
            departmentHistoryDatabase.filter(entry => String(entry.id) !== String(id));

        displayStaffHistoryManagement(staffId);

    } catch (error) {
        console.error(error);
        alert("An unexpected error occurred while removing the entry.");
    }

}


/* =====================================================
   EMPLOYEE FILE MODAL (PUBLIC STAFF LIST)
===================================================== */

function openEmployeeFile(staffId) {

    const modal = document.getElementById("employeeFileModal");
    const content = document.getElementById("employeeFileContent");

    if (!modal || !content) return;

    const member = staffDatabase.find(
        item => String(item.id) === String(staffId)
    );

    if (!member) {
        alert("Staff member could not be found.");
        return;
    }

    const serviceDays = calculateServiceDays(member.startDate, member.endDate);
    const avatar = getSafeLogoUrl(member.avatarUrl);
    const departmentLogo = getDepartmentLogo(member.department);

    const monthCount = spotlightCounts.month[String(member.id)] || 0;
    const weekCount = spotlightCounts.week[String(member.id)] || 0;

    const pastEntries = departmentHistoryDatabase.filter(
        entry => String(entry.staffId) === String(member.id)
    );

    content.innerHTML = `

        <h2 style="text-align:center; margin: 5px 0 22px; font-size:24px;">
            ${escapeHTML(member.username)}
        </h2>

        <div style="display:flex; gap:18px; align-items:flex-start; margin-bottom:20px;">

            <div style="width:88px; height:88px; border-radius:12px; overflow:hidden; background:#292d38; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:26px; color:#aaa;">
                ${
                    avatar
                        ? `<img src="${escapeHTML(avatar)}" alt="" style="width:100%; height:100%; object-fit:cover;">`
                        : escapeHTML(member.username.charAt(0).toUpperCase())
                }
            </div>

            <div style="flex:1; padding-top:4px;">

                ${
                    member.robloxId
                        ? `<p style="color:#858b98; font-size:13px; margin-bottom:8px;"><strong style="color:#c7cad2;">Roblox ID:</strong> ${escapeHTML(member.robloxId)}</p>`
                        : ""
                }

                <p style="color:#858b98; font-size:13px;"><strong style="color:#c7cad2;">Current Department:</strong> ${escapeHTML(member.department)}</p>

            </div>

        </div>

        <div style="margin-bottom:20px;">

            <p style="color:#858b98; font-size:13px; margin-bottom:6px;"><strong style="color:#c7cad2;">Start Date:</strong> ${formatDate(member.startDate)}</p>

            ${
                member.endDate
                    ? `<p style="color:#858b98; font-size:13px; margin-bottom:6px;"><strong style="color:#c7cad2;">End Date:</strong> ${formatDate(member.endDate)}</p>`
                    : ""
            }

            <p style="color:#858b98; font-size:13px;"><strong style="color:#c7cad2;">Total Days Served:</strong> ${serviceDays} Days</p>

        </div>

        <div style="text-align:center; margin-bottom:5px;">

            <p style="font-weight:800; font-size:17px; display:flex; align-items:center; justify-content:center; gap:8px; margin:0;">

                ${
                    getRankLogo(member.rank)
                        ? `<img src="${escapeHTML(getRankLogo(member.rank))}" alt="" style="width:22px; height:22px; object-fit:contain; border-radius:5px;">`
                        : ""
                }

                ${escapeHTML(member.rank)}

                ${
                    departmentLogo
                        ? `<img src="${escapeHTML(departmentLogo)}" alt="" style="width:22px; height:22px; object-fit:contain; border-radius:5px;">`
                        : ""
                }

            </p>

        </div>

        ${
            (monthCount > 0 || weekCount > 0)
                ? `
                    <div style="border-top:2px solid #b58a28; margin: 20px 0;"></div>

                    <div style="display:flex; justify-content:center; gap:36px;">

                        ${
                            weekCount > 0
                                ? `<div style="text-align:center;"><strong style="font-size:20px; color:#b58a28; display:block;">${weekCount}</strong><p style="color:#858b98; font-size:11px; margin-top:2px;">Staff of the Week</p></div>`
                                : ""
                        }

                        ${
                            monthCount > 0
                                ? `<div style="text-align:center;"><strong style="font-size:20px; color:#b58a28; display:block;">${monthCount}</strong><p style="color:#858b98; font-size:11px; margin-top:2px;">Staff of the Month</p></div>`
                                : ""
                        }

                    </div>
                `
                : ""
        }

        ${
            pastEntries.length > 0
                ? `
                    <div style="border-top:2px solid #b58a28; margin: 20px 0 15px;"></div>

                    <p style="font-weight:800; font-size:13px; margin-bottom:12px; color:#c7cad2; text-transform:uppercase; letter-spacing:0.5px;">
                        Past Departments
                    </p>

                    ${pastEntries.map(entry => `
                        <div style="padding:10px 0; border-bottom:1px solid #242730;">
                            <p style="font-weight:700; font-size:14px; margin-bottom:3px;">${escapeHTML(entry.department)}</p>
                            <p style="color:#858b98; font-size:12px;">
                                ${entry.rank ? escapeHTML(entry.rank) + " &middot; " : ""}${entry.status ? escapeHTML(entry.status) + " &middot; " : ""}${calculateServiceDays(entry.startDate, entry.endDate)} Days
                            </p>
                        </div>
                    `).join("")}
                `
                : ""
        }

    `;

    modal.classList.remove("hidden");

}


function closeEmployeeFile() {

    const modal = document.getElementById("employeeFileModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


/* =====================================================
   GET DEPARTMENT LOGO
===================================================== */

function getDepartmentLogo(departmentName) {

    if (!departmentName) {
        return "";
    }

    const department =
        departmentDatabase.find(
            department =>
                department.name.toLowerCase() ===
                departmentName.toLowerCase()
        );

    if (!department) {
        return "";
    }

    return getSafeLogoUrl(
        department.logoUrl
    );

}


/* =====================================================
   GET RANK LOGO
===================================================== */

function getRankLogo(rankName) {

    if (!rankName) {
        return "";
    }

    const rank =
        rankDatabase.find(
            rank =>
                rank.name.toLowerCase() ===
                rankName.toLowerCase()
        );

    if (!rank) {
        return "";
    }

    return getSafeLogoUrl(
        rank.logoUrl
    );

}

setupEventListeners();
setupCreateEditorForm();
