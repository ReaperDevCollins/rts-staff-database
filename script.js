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


/* =====================================================
   AUTHORIZED EDITOR
===================================================== */

const AUTHORIZED_EDITOR_ID =
    "6ef6fb66-72cf-4739-8ca5-c6ac24f968e1";


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
   LOCAL RANK / STATUS CONFIGURATION
===================================================== */

function getRanks() {

    const saved =
        localStorage.getItem("rtsRanks");

    if (saved) {

        try {
            return JSON.parse(saved);
        }

        catch {
            return [...defaultRanks];
        }

    }

    localStorage.setItem(
        "rtsRanks",
        JSON.stringify(defaultRanks)
    );

    return [...defaultRanks];

}


function getStatuses() {

    const saved =
        localStorage.getItem("rtsStatuses");

    if (saved) {

        try {
            return JSON.parse(saved);
        }

        catch {
            return [...defaultStatuses];
        }

    }

    localStorage.setItem(
        "rtsStatuses",
        JSON.stringify(defaultStatuses)
    );

    return [...defaultStatuses];

}


function saveRanks(ranks) {

    localStorage.setItem(
        "rtsRanks",
        JSON.stringify(ranks)
    );

}


function saveStatuses(statuses) {

    localStorage.setItem(
        "rtsStatuses",
        JSON.stringify(statuses)
    );

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

        getStatuses().forEach(
            status => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    status;

                option.textContent =
                    status;

                statusFilter.appendChild(
                    option
                );

            }
        );

    }


    if (rankFilter) {

        rankFilter.innerHTML =
            `<option value="all">All Ranks</option>`;

        getRanks().forEach(
            rank => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    rank;

                option.textContent =
                    rank;

                rankFilter.appendChild(
                    option
                );

            }
        );

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

                    <div class="staff-username">

                        ${escapeHTML(
                            staff.username
                        )}

                    </div>

                </div>

                <div class="staff-rank">

                    ${escapeHTML(
                        staff.rank
                    )}

                </div>

                <div>

                    <span class="staff-status">

                        ${escapeHTML(
                            staff.status
                        )}

                    </span>

                </div>

                <div class="staff-department-cell">

                    ${escapeHTML(
                        staff.department
                    )}

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


                if (
                    data.user.id !==
                    AUTHORIZED_EDITOR_ID
                ) {

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


        if (
            session.user.id !==
            AUTHORIZED_EDITOR_ID
        ) {

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


                <div class="editor-staff-detail">

                    ${escapeHTML(
                        member.rank
                    )}

                </div>


                <div class="editor-staff-detail">

                    ${escapeHTML(
                        member.status
                    )}

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


    getRanks().forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                value;

            rank.appendChild(option);

        }
    );


    getStatuses().forEach(
        value => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                value;

            option.textContent =
                value;

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

    }

    else {

        document.getElementById(
            "staffFormTitle"
        ).textContent =
            "Add Staff Member";

        updateServicePreview();

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
   HOMEPAGE DEPARTMENTS
===================================================== */

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
        .slice(0, 4)
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

    const container =
        document.getElementById(
            "rankManagementList"
        );


    if (!container) {
        return;
    }


    const ranks =
        getRanks();


    container.innerHTML = "";


    ranks.forEach(
        (rank, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "management-item";


            item.innerHTML = `

                <span class="management-name">

                    ${escapeHTML(rank)}

                </span>


                <div class="management-actions">

                    <button
                        class="management-button"
                        onclick="editRank(${index})"
                    >
                        Edit
                    </button>


                    <button
                        class="management-button delete"
                        onclick="removeRank(${index})"
                    >
                        Remove
                    </button>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


function addRank() {

    const name =
        prompt(
            "Enter the name of the new rank:"
        );


    if (!name) {
        return;
    }


    const cleanName =
        name.trim();


    if (!cleanName) {
        return;
    }


    const ranks =
        getRanks();


    const exists =
        ranks.some(
            rank =>
                rank.toLowerCase() ===
                cleanName.toLowerCase()
        );


    if (exists) {

        alert(
            "That rank already exists."
        );

        return;

    }


    ranks.push(cleanName);

    saveRanks(ranks);

    displayRankManagement();

    populateStaffFormOptions();

}


function editRank(index) {

    const ranks =
        getRanks();


    const oldName =
        ranks[index];


    const newName =
        prompt(
            "Enter the new rank name:",
            oldName
        );


    if (!newName) {
        return;
    }


    const cleanName =
        newName.trim();


    if (!cleanName) {
        return;
    }


    ranks[index] =
        cleanName;


    saveRanks(ranks);

    displayRankManagement();

    populateStaffFormOptions();

}


function removeRank(index) {

    const ranks =
        getRanks();


    const rank =
        ranks[index];


    if (!rank) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to remove "${rank}"?`
        );


    if (!confirmed) {
        return;
    }


    ranks.splice(index, 1);

    saveRanks(ranks);

    displayRankManagement();

    populateStaffFormOptions();

}


/* =====================================================
   STATUS MANAGEMENT
===================================================== */

function displayStatusManagement() {

    const container =
        document.getElementById(
            "statusManagementList"
        );


    if (!container) {
        return;
    }


    const statuses =
        getStatuses();


    container.innerHTML = "";


    statuses.forEach(
        (status, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "management-item";


            item.innerHTML = `

                <span class="management-name">

                    ${escapeHTML(status)}

                </span>


                <div class="management-actions">

                    <button
                        class="management-button"
                        onclick="editStatus(${index})"
                    >
                        Edit
                    </button>


                    <button
                        class="management-button delete"
                        onclick="removeStatus(${index})"
                    >
                        Remove
                    </button>

                </div>

            `;


            container.appendChild(item);

        }
    );

}


function addStatus() {

    const name =
        prompt(
            "Enter the name of the new status:"
        );


    if (!name) {
        return;
    }


    const cleanName =
        name.trim();


    if (!cleanName) {
        return;
    }


    const statuses =
        getStatuses();


    const exists =
        statuses.some(
            status =>
                status.toLowerCase() ===
                cleanName.toLowerCase()
        );


    if (exists) {

        alert(
            "That status already exists."
        );

        return;

    }


    statuses.push(cleanName);

    saveStatuses(statuses);

    displayStatusManagement();

    populateStaffFormOptions();

}


function editStatus(index) {

    const statuses =
        getStatuses();


    const oldName =
        statuses[index];


    const newName =
        prompt(
            "Enter the new status name:",
            oldName
        );


    if (!newName) {
        return;
    }


    const cleanName =
        newName.trim();


    if (!cleanName) {
        return;
    }


    statuses[index] =
        cleanName;


    saveStatuses(statuses);

    displayStatusManagement();

    populateStaffFormOptions();

}


function removeStatus(index) {

    const statuses =
        getStatuses();


    const status =
        statuses[index];


    if (!status) {
        return;
    }


    const confirmed =
        confirm(
            `Are you sure you want to remove "${status}"?`
        );


    if (!confirmed) {
        return;
    }


    statuses.splice(index, 1);

    saveStatuses(statuses);

    displayStatusManagement();

    populateStaffFormOptions();

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

}


function adminLogout() {

    sessionStorage.removeItem(
        "rtsAdminLoggedIn"
    );

    location.reload();

}


function checkAdminSession() {

    const loggedIn =
        sessionStorage.getItem(
            "rtsAdminLoggedIn"
        );


    if (
        loggedIn === "true"
    ) {

        showAdminPanel();

    }

}


/* =====================================================
   EVENT LISTENERS
===================================================== */

function setupEventListeners() {

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
   INITIALIZE WEBSITE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupEditorLogin();

        setupStaffForm();

        setupDepartmentForm();

        setupEventListeners();


        /* =============================================
           LOAD DEPARTMENTS
        ============================================== */

        await loadDepartmentDatabase();


        /* =============================================
           HOMEPAGE
        ============================================== */

        displayHomepageDepartments();


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

        checkAdminSession();


        /* =============================================
           CONFIGURATION
        ============================================== */

        displayRankManagement();

        displayStatusManagement();

        displayDepartmentManagement();

    }
);