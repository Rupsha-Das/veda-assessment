import Image from "next/image";

export default function TeacherIllustration() {
  return (
    <div className="relative w-[min(68vw,320px)] overflow-hidden rounded-[2px]">
      <Image
        src="/teacher-illustration.png"
        alt="Teacher reviewing a student's answers"
        width={1253}
        height={1253}
        priority
        className="h-auto w-full"
      />
    </div>
  );
}
